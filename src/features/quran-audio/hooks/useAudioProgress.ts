import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import type { AudioPlayer, AudioStatus } from "expo-audio";

import {
  getAudioProgress,
  saveAudioProgress,
  clearAudioProgress,
} from "@/store/audioProgressStore";

export interface UseAudioProgressOptions {
  player: AudioPlayer | null;
  status: AudioStatus | null;
  chapterId: number;
  enabled?: boolean;
  audioLanguage: string;
  reciterId: number | string;
  isChangingTrack?: boolean;
  isRepeating?: boolean;
}

/**
 * Dedicated hook to track, auto-save, and restore audio playback progress.
 *
 * Responsibilities:
 * - Saves progress independently for EVERY chapter (keyed by chapter + language + reciter).
 * - Periodically auto-saves progress every 5 seconds while playing.
 * - Saves progress immediately on AppState background/inactive (protects kill-from-RAM).
 * - Saves progress immediately on modal close, unmount, or chapter switch.
 * - Restores progress when track is loaded (if > 5s and < 95% total duration).
 * - Safe against accessing released native AudioPlayer instances during teardown/unmount.
 * - Never clobbers valid progress with 0.
 * - Clears saved progress when audio naturally finishes or exceeds 95% completion.
 */
export function useAudioProgress({
  player,
  status,
  chapterId,
  enabled = true,
  audioLanguage,
  reciterId,
  isChangingTrack = false,
  isRepeating = false,
}: UseAudioProgressOptions) {
  const currentChapterIdRef = useRef<number>(chapterId);
  const pendingSeekPositionRef = useRef<number | null>(null);
  const isSeekingRef = useRef<boolean>(false);
  const autoSaveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const lastValidPositionRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const audioLanguageRef = useRef<string>(audioLanguage);
  const reciterIdRef = useRef<number | string>(reciterId);

  // Keep live references updated without re-triggering effects
  audioLanguageRef.current = audioLanguage;
  reciterIdRef.current = reciterId;
  currentTimeRef.current = status?.currentTime ?? 0;
  isPlayingRef.current = Boolean(status?.playing);

  // Track latest valid positive playback position for the current chapter
  useEffect(() => {
    const cur = status?.currentTime ?? 0;
    if (cur > 0 && Number.isFinite(cur)) {
      lastValidPositionRef.current = cur;
    }
  }, [status?.currentTime]);

  useEffect(() => {
    if (status?.duration != null && status.duration > 0) {
      durationRef.current = status.duration;
    }
  }, [status?.duration]);

  /**
   * Helper to safely read duration from player without throwing if the
   * underlying native shared object was already released.
   */
  const getSafeDuration = useCallback(() => {
    if (status?.duration != null && status.duration > 0) {
      return status.duration;
    }
    try {
      if (player && typeof player.duration === "number" && player.duration > 0) {
        return player.duration;
      }
    } catch {
      // Ignored if player was released by expo-audio
    }
    return durationRef.current;
  }, [player, status?.duration]);

  /**
   * Saves current playback position for the active (or specified) chapter.
   * Protected: Never persists position <= 0 to avoid wiping valid progress.
   * Safe against accessing already released native AudioPlayer instance.
   */
  const saveCurrentProgress = useCallback(
    (targetChapterId?: number) => {
      const current = currentTimeRef.current;
      const pos = current > 0 ? current : lastValidPositionRef.current;
      const dur = getSafeDuration();
      const chId = targetChapterId ?? currentChapterIdRef.current ?? chapterId;

      if (pos > 0 && dur > 0 && chId > 0) {
        saveAudioProgress({
          chapterId: chId,
          position: pos,
          duration: dur,
          audioLanguage: audioLanguageRef.current,
          reciterId: reciterIdRef.current,
          savedAt: Date.now(),
        });
      }
    },
    [getSafeDuration, chapterId],
  );

  // Track switching & restore detection:
  // When chapterId, language, or reciter changes:
  // 1. Flush-save progress for the outgoing chapter.
  // 2. Load and prepare restore position for the incoming chapter.
  useEffect(() => {
    if (!enabled) return;

    if (currentChapterIdRef.current !== chapterId) {
      saveCurrentProgress(currentChapterIdRef.current);
      currentChapterIdRef.current = chapterId;
      lastValidPositionRef.current = 0;
    }

    const saved = getAudioProgress(chapterId, audioLanguage, reciterId);
    if (saved && saved.position > 5) {
      const pct = saved.duration > 0 ? saved.position / saved.duration : 0;
      if (pct < 0.95) {
        pendingSeekPositionRef.current = saved.position;
      } else {
        clearAudioProgress(chapterId, audioLanguage, reciterId);
        pendingSeekPositionRef.current = null;
      }
    } else {
      pendingSeekPositionRef.current = null;
    }
  }, [chapterId, audioLanguage, reciterId, enabled, saveCurrentProgress]);

  // Execute restore seek once track transition completes and player is loaded
  useEffect(() => {
    if (
      isChangingTrack ||
      !player ||
      pendingSeekPositionRef.current === null ||
      isSeekingRef.current
    ) {
      return;
    }

    const dur = getSafeDuration();
    const isBufferingOrLoading =
      status?.isBuffering ||
      status?.playbackState === "loading" ||
      status?.playbackState === "buffering";

    // Wait until track duration is loaded and player is ready
    if (dur <= 0 || isBufferingOrLoading) {
      return;
    }

    const target = pendingSeekPositionRef.current;
    isSeekingRef.current = true;

    try {
      const seekPromise = player.seekTo(target);
      if (seekPromise && typeof (seekPromise as Promise<void>).then === "function") {
        (seekPromise as Promise<void>)
          .then(() => {
            pendingSeekPositionRef.current = null;
            isSeekingRef.current = false;
          })
          .catch(() => {
            // Keep pendingSeekPositionRef intact to retry on next tick
            isSeekingRef.current = false;
          });
      } else {
        pendingSeekPositionRef.current = null;
        isSeekingRef.current = false;
      }
    } catch {
      isSeekingRef.current = false;
    }
  }, [
    isChangingTrack,
    player,
    getSafeDuration,
    status?.playbackState,
    status?.isBuffering,
    status?.isLoaded,
  ]);

  // Confirm seek landed
  useEffect(() => {
    if (
      pendingSeekPositionRef.current !== null &&
      Math.abs((status?.currentTime ?? 0) - pendingSeekPositionRef.current) < 2.0
    ) {
      pendingSeekPositionRef.current = null;
      isSeekingRef.current = false;
    }
  }, [status?.currentTime]);

  // Periodic auto-save every 5s while playing (safely reads duration)
  useEffect(() => {
    if (!enabled || !player) return;

    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(() => {
      const pos = currentTimeRef.current;
      const dur = getSafeDuration();

      if (pos > 0 && dur > 0 && isPlayingRef.current) {
        saveCurrentProgress();
      }
    }, 5000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [enabled, player, chapterId, audioLanguage, reciterId, saveCurrentProgress, getSafeDuration]);

  // AppState background/inactive save (crucial for surviving kill-from-RAM)
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        saveCurrentProgress();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, [saveCurrentProgress]);

  // Save progress when modal closes
  useEffect(() => {
    if (!enabled) {
      saveCurrentProgress();
    }
  }, [enabled, saveCurrentProgress]);

  // Save progress and clean up timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
      saveCurrentProgress();
    };
  }, [saveCurrentProgress]);

  // Clear saved progress for this chapter when playback completes naturally
  useEffect(() => {
    const isFinished =
      Boolean(status?.didJustFinish) ||
      status?.playbackState === "completed";

    if (isFinished && !isRepeating) {
      clearAudioProgress(chapterId, audioLanguage, reciterId);
      lastValidPositionRef.current = 0;
    }
  }, [status?.didJustFinish, status?.playbackState, isRepeating, chapterId, audioLanguage, reciterId]);

  return {
    saveCurrentProgress,
    clearAudioProgress: () => clearAudioProgress(chapterId, audioLanguage, reciterId),
  };
}

export const useChapterAudioProgress = useAudioProgress;
