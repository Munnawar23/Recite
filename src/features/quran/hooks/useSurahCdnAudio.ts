import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  type AudioMetadata,
} from "expo-audio";

import { getSurahCdnAudioUrl } from "@/lib/api/surah-cdn-audio";
import { useBackgroundPlay } from "@/hooks/useBackgroundPlay";
import { Haptics } from "@/lib/haptics";
import { getLocalAudioPath } from "@/services/downloadService";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useAudioProgressStore } from "@/store/audioProgressStore";

export interface UseSurahCdnAudioOptions {
  chapterId: number;
  enabled?: boolean;
  localizedName?: string;
  arabicName?: string;
  onPlayNext?: () => void;
}

export function useSurahCdnAudio({
  chapterId,
  enabled = true,
  localizedName,
  arabicName,
  onPlayNext,
}: UseSurahCdnAudioOptions) {
  const { saveProgress, getProgress, clearProgress } = useAudioProgressStore();

  // Check if downloaded locally
  const isDownloaded = useDownloadsStore(
    (s) => chapterId != null && s.isDownloaded(chapterId),
  );

  // 1. Audio source URLs
  const remoteAudioUrl = useMemo(() => {
    if (!chapterId || chapterId < 1 || chapterId > 114) return null;
    return getSurahCdnAudioUrl(chapterId);
  }, [chapterId]);

  const localUri = useMemo(() => {
    if (enabled && isDownloaded && chapterId) {
      return getLocalAudioPath(chapterId);
    }
    return null;
  }, [enabled, isDownloaded, chapterId]);

  const audioUrl = localUri ?? remoteAudioUrl;

  // 2. Initialize expo-audio player
  const player = useAudioPlayer(
    enabled && audioUrl ? { uri: audioUrl } : undefined,
  );
  const status = useAudioPlayerStatus(player);

  // Minimal UI state (no slider sync re-render spam)
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isChangingTrack, setIsChangingTrack] = useState<boolean>(true);

  // Tracking refs
  const loadedAudioUrlRef = useRef<string | null>(null);
  const wasEnabledRef = useRef<boolean>(false);
  const hasRestoredProgressRef = useRef<boolean>(false);
  const lastKnownPosRef = useRef<number>(0);

  // Synchronously capture highest non-zero playback time on every render
  const currentPos = player?.currentTime || status?.currentTime || 0;
  if (currentPos > 0) {
    lastKnownPosRef.current = currentPos;
  }

  // Reliable instant save helper
  const saveCurrentProgress = useCallback(() => {
    const pos =
      (player?.currentTime && player.currentTime > 0
        ? player.currentTime
        : 0) ||
      lastKnownPosRef.current ||
      status?.currentTime ||
      0;
    const dur = player?.duration || status?.duration || 0;
    if (chapterId && pos > 0) {
      saveProgress(chapterId, pos, dur);
    }
  }, [chapterId, player, status?.currentTime, status?.duration, saveProgress]);

  // Effect 1: Track switching and auto-play on modal open
  useEffect(() => {
    if (!enabled || !audioUrl || !player) {
      wasEnabledRef.current = enabled;
      return;
    }

    const justOpened = !wasEnabledRef.current && enabled;
    wasEnabledRef.current = enabled;

    if (loadedAudioUrlRef.current === audioUrl) {
      if (justOpened && !status?.playing) {
        player.play();
      }
      return;
    }

    // New track selected
    loadedAudioUrlRef.current = audioUrl;
    hasRestoredProgressRef.current = false;
    lastKnownPosRef.current = 0;
    setIsChangingTrack(true);
    player.replace({ uri: audioUrl });
    player.play();
  }, [enabled, audioUrl, player]);

  // Effect 2: Restore progress once duration becomes available
  useEffect(() => {
    const dur = status?.duration ?? 0;
    if (dur > 0 && !status?.isBuffering) {
      setIsChangingTrack(false);

      if (!hasRestoredProgressRef.current && player) {
        hasRestoredProgressRef.current = true;
        const saved = getProgress(chapterId);
        if (saved > 2 && saved < dur - 3) {
          player.seekTo(saved);
          lastKnownPosRef.current = saved;
        }
      }
    }
  }, [status?.duration, status?.isBuffering, player, chapterId, getProgress]);

  // Effect 3: Throttled periodic save (runs once every 3s ONLY while playing, ZERO re-renders)
  useEffect(() => {
    if (!enabled || !status?.playing) return;

    const interval = setInterval(() => {
      const pos = player?.currentTime || lastKnownPosRef.current || 0;
      const dur = player?.duration || 0;
      if (pos > 0) {
        saveProgress(chapterId, pos, dur);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [enabled, status?.playing, chapterId, player, saveProgress]);

  // Effect 4: Immediate save when modal closes or unmounts
  useEffect(() => {
    if (!enabled) {
      saveCurrentProgress();
      if (player && status?.playing) {
        player.pause();
      }
    }
  }, [enabled, saveCurrentProgress, player, status?.playing]);

  useEffect(() => {
    return () => {
      saveCurrentProgress();
    };
  }, [saveCurrentProgress]);

  // Effect 5: Reset progress on track finish and play next
  useEffect(() => {
    if (
      status?.duration &&
      status.duration > 0 &&
      (status.playbackState === "completed" ||
        (status.currentTime >= status.duration - 0.5 && status.duration > 5))
    ) {
      clearProgress(chapterId);
      lastKnownPosRef.current = 0;
      if (!isRepeating && onPlayNext) {
        onPlayNext();
      }
    }
  }, [
    status?.playbackState,
    status?.currentTime,
    status?.duration,
    isRepeating,
    onPlayNext,
    chapterId,
    clearProgress,
  ]);

  // Combined loading state
  const isLoading =
    enabled &&
    (isChangingTrack ||
      Boolean(status?.isBuffering) ||
      status?.playbackState === "loading" ||
      status?.playbackState === "buffering" ||
      (status?.duration ?? 0) <= 0);

  // Control Handlers
  const handlePlayPause = useCallback(() => {
    Haptics.light();
    if (!player) return;
    if (status?.playing) {
      saveCurrentProgress();
      player.pause();
    } else {
      player.play();
    }
  }, [player, status?.playing, saveCurrentProgress]);

  const handleSkipBack = useCallback(() => {
    Haptics.light();
    if (!player) return;
    const current = player.currentTime || status?.currentTime || 0;
    const dur = player.duration || status?.duration || 0;
    const target = Math.max(0, current - 10);
    player.seekTo(target);
    lastKnownPosRef.current = target;
    saveProgress(chapterId, target, dur);
  }, [player, status?.currentTime, status?.duration, chapterId, saveProgress]);

  const handleSkipForward = useCallback(() => {
    Haptics.light();
    if (!player) return;
    const current = player.currentTime || status?.currentTime || 0;
    const dur = player.duration || status?.duration || 0;
    const target = Math.min(dur, current + 10);
    player.seekTo(target);
    lastKnownPosRef.current = target;
    saveProgress(chapterId, target, dur);
  }, [player, status?.currentTime, status?.duration, chapterId, saveProgress]);

  const cycleSpeed = useCallback(() => {
    Haptics.light();
    const next =
      playbackSpeed === 1.0
        ? 1.25
        : playbackSpeed === 1.25
          ? 1.5
          : playbackSpeed === 1.5
            ? 2.0
            : 1.0;
    setPlaybackSpeed(next);
    if (player) {
      player.setPlaybackRate(next);
    }
  }, [player, playbackSpeed]);

  const toggleRepeat = useCallback(() => {
    Haptics.light();
    const next = !isRepeating;
    setIsRepeating(next);
    if (player) {
      player.loop = next;
    }
  }, [player, isRepeating]);

  const handleSliderValueChange = useCallback((val: number) => {
    setIsDragging(true);
    setSliderValue(val);
  }, []);

  const handleSlidingComplete = useCallback(
    (val: number) => {
      player?.seekTo(val);
      lastKnownPosRef.current = val;
      setIsDragging(false);
      saveProgress(chapterId, val, player?.duration || status?.duration || 0);
    },
    [player, status?.duration, chapterId, saveProgress],
  );

  // Background Lock Screen Audio
  const lockScreenMetadata = useMemo<AudioMetadata>(() => {
    const title = localizedName
      ? arabicName
        ? `${localizedName} (${arabicName})`
        : localizedName
      : `Surah ${chapterId}`;

    return {
      title,
      artist: "Mishary Rashid Alafasy & Ibrahim Walk",
      albumTitle: "The Noble Quran (Saheeh International)",
    };
  }, [localizedName, arabicName, chapterId]);

  useBackgroundPlay({
    player: enabled ? player : null,
    isPlaying: status?.playing,
    metadata: lockScreenMetadata,
    enabled,
  });

  // Display initial saved position before player status loads
  const savedPos = getProgress(chapterId);
  const displayCurrentTime =
    !hasRestoredProgressRef.current && savedPos > 2
      ? savedPos
      : status?.currentTime || 0;

  return {
    player,
    status,
    audioUrl,
    remoteAudioUrl,
    isDownloaded,
    isPlayingLocally: !!localUri,
    isLoading,
    isPlaying: !!status?.playing,
    currentTime: displayCurrentTime,
    duration: status?.duration || 0,
    sliderValue,
    isDragging,
    playbackSpeed,
    isRepeating,
    handlePlayPause,
    handleSkipBack,
    handleSkipForward,
    cycleSpeed,
    toggleRepeat,
    handleSliderValueChange,
    handleSlidingComplete,
  };
}
