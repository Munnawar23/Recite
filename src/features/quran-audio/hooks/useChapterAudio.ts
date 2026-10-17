import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  type AudioMetadata,
} from "expo-audio";
import { useQuery } from "@tanstack/react-query";

import { getChapterAudio } from "@/lib/api";
import { getSurahCdnAudioUrl } from "@/lib/api/surah-cdn-audio";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import {
  DEFAULT_RECITER_ID,
  RECITER_OPTIONS,
  AUDIO_RECITERS,
  DEFAULT_ENGLISH_RECITER_NAME,
} from "@/constants";
import { useBackgroundPlay } from "@/hooks/useBackgroundPlay";
import { Haptics } from "@/lib/haptics";

export interface UseChapterAudioOptions {
  chapterId: number;
  enabled?: boolean;
  localizedName?: string;
  arabicName?: string;
  onPlayNext?: () => void;
  audioLanguage?: "en" | "ar" | string;
  editionName?: string;
}

export function useChapterAudio({
  chapterId,
  enabled = true,
  localizedName,
  arabicName,
  onPlayNext,
  audioLanguage = "en",
  editionName,
}: UseChapterAudioOptions) {
  const isArabicAudio = audioLanguage === "ar";
  const isEnglishAudio = audioLanguage === "en";
  const { reciterId: globalReciterId } = useQuranSettingsStore();
  const reciterId = globalReciterId || DEFAULT_RECITER_ID;

  // Always fetch Arabic recitation audio online (same API as Quran Detail AudioPlayer)
  const { data: arabicAudioData, isLoading: isLoadingArabicAudio } = useQuery({
    queryKey: ["chapter-audio", chapterId, reciterId],
    queryFn: () => getChapterAudio(chapterId, reciterId),
    enabled: enabled && isArabicAudio && !!chapterId && chapterId > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: Infinity,
  });

  const remoteArabicUrl = useMemo(() => {
    if (!arabicAudioData?.audio_url) return null;
    let url = arabicAudioData.audio_url;
    if (url.startsWith("//")) {
      url = `https:${url}`;
    }
    return url;
  }, [arabicAudioData]);

  const englishCdnUrl = useMemo(() => {
    if (!chapterId || chapterId < 1 || chapterId > 114) return null;
    return getSurahCdnAudioUrl(chapterId, {
      edition: editionName || DEFAULT_ENGLISH_RECITER_NAME,
    });
  }, [chapterId, editionName]);

  const activeAudioReciter = useMemo(() => {
    if (isEnglishAudio) {
      return (
        AUDIO_RECITERS.find(
          (r) => r.name === (editionName || DEFAULT_ENGLISH_RECITER_NAME),
        ) || AUDIO_RECITERS[0]
      );
    }
    return null;
  }, [isEnglishAudio, editionName]);

  // Always stream audio online depending on selected language
  const audioUrl = useMemo(() => {
    if (isArabicAudio) {
      return remoteArabicUrl; // Quran.com recitation API
    }
    if (isEnglishAudio) {
      return englishCdnUrl; // Islamic Network CDN English translation
    }
    return englishCdnUrl; // Default fallback
  }, [isArabicAudio, isEnglishAudio, remoteArabicUrl, englishCdnUrl]);

  // Active Reciter Name
  const reciterName = useMemo(() => {
    if (isArabicAudio) {
      const activeReciter = RECITER_OPTIONS.find((r) => r.id === reciterId);
      return activeReciter ? activeReciter.label : "Mishary Rashid Alafasy";
    }
    if (isEnglishAudio) {
      return activeAudioReciter?.label || "Mishary Rashid Alafasy & Ibrahim Walk";
    }
    return "Mishary Rashid Alafasy & Ibrahim Walk";
  }, [isArabicAudio, isEnglishAudio, reciterId, activeAudioReciter]);

  // Initialize expo-audio player
  const player = useAudioPlayer(
    enabled && audioUrl ? { uri: audioUrl } : undefined,
  );
  const status = useAudioPlayerStatus(player);

  // Minimal UI state
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isChangingTrack, setIsChangingTrack] = useState<boolean>(true);

  // Tracking refs
  const loadedAudioUrlRef = useRef<string | null>(null);
  const wasEnabledRef = useRef<boolean>(false);
  const seekTargetRef = useRef<number | null>(null);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHandledCompletionRef = useRef<boolean>(false);

  // Clear seek target once player's currentTime catches up near the target
  if (
    seekTargetRef.current !== null &&
    Math.abs((status?.currentTime || 0) - seekTargetRef.current) < 1.0
  ) {
    seekTargetRef.current = null;
    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
  }

  // Pure derived state: No useEffect, zero extra renders during normal playback!
  const isDragging = dragValue !== null;
  const sliderValue = dragValue ?? seekTargetRef.current ?? status?.currentTime ?? 0;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    };
  }, []);

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
    hasHandledCompletionRef.current = false;
    seekTargetRef.current = null;
    setDragValue(null);
    setIsChangingTrack(true);
    player.replace({ uri: audioUrl });
    player.play();
  }, [enabled, audioUrl, player, status?.playing]);

  // Effect 2: Clear track loading once duration becomes available
  useEffect(() => {
    const dur = status?.duration ?? 0;
    if (dur > 0 && !status?.isBuffering) {
      setIsChangingTrack(false);
    }
  }, [status?.duration, status?.isBuffering]);

  // Effect 3: Stop when modal closes
  useEffect(() => {
    if (!enabled) {
      if (player && status?.playing) {
        player.pause();
      }
    }
  }, [enabled, player, status?.playing]);

  // Effect 4: Play next on track completion (only fires on completion events, not on every tick)
  useEffect(() => {
    const isFinished =
      Boolean(status?.didJustFinish) ||
      status?.playbackState === "completed";

    if (isFinished) {
      if (!isRepeating && onPlayNext && !hasHandledCompletionRef.current) {
        hasHandledCompletionRef.current = true;
        onPlayNext();
      }
    } else {
      // Reset completion flag if track is playing normally
      hasHandledCompletionRef.current = false;
    }
  }, [
    status?.didJustFinish,
    status?.playbackState,
    isRepeating,
    onPlayNext,
  ]);

  // Combined loading state
  const isFetchingAudio = isArabicAudio && isLoadingArabicAudio && !audioUrl;
  const isLoading =
    enabled &&
    (isChangingTrack ||
      isFetchingAudio ||
      Boolean(status?.isBuffering) ||
      status?.playbackState === "loading" ||
      status?.playbackState === "buffering" ||
      (status?.duration ?? 0) <= 0);

  // Control Handlers
  const handlePlayPause = useCallback(() => {
    Haptics.light();
    if (!player) return;
    if (status?.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, status?.playing]);

  const handleSkipBack = useCallback(() => {
    Haptics.light();
    if (!player) return;
    const current = player.currentTime || status?.currentTime || 0;
    const target = Math.max(0, current - 10);
    player.seekTo(target);
  }, [player, status?.currentTime]);

  const handleSkipForward = useCallback(() => {
    Haptics.light();
    if (!player) return;
    const current = player.currentTime || status?.currentTime || 0;
    const dur = player.duration || status?.duration || 0;
    const target = Math.min(dur, current + 10);
    player.seekTo(target);
  }, [player, status?.currentTime, status?.duration]);

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
    setDragValue(val);
  }, []);

  const handleSlidingComplete = useCallback(
    (val: number) => {
      seekTargetRef.current = val;
      setDragValue(null);
      player?.seekTo(val);
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = setTimeout(() => {
        seekTargetRef.current = null;
      }, 800);
    },
    [player],
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
      artist: reciterName,
      albumTitle: isArabicAudio
        ? "The Noble Quran"
        : "The Noble Quran (Saheeh International)",
    };
  }, [localizedName, arabicName, chapterId, reciterName, isArabicAudio]);

  useBackgroundPlay({
    player: enabled ? player : null,
    isPlaying: status?.playing,
    metadata: lockScreenMetadata,
    reciterId: isArabicAudio ? reciterId : (activeAudioReciter?.id ?? DEFAULT_RECITER_ID),
    artworkModule: isArabicAudio ? undefined : activeAudioReciter?.avatar,
    enabled,
  });

  return {
    player,
    status,
    audioUrl,
    remoteAudioUrl: audioUrl,
    reciterName,
    isArabicAudio,
    isEnglishAudio,
    isLoading,
    isPlaying: !!status?.playing,
    currentTime: status?.currentTime || 0,
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

// Backward-compatible alias
export const useSurahCdnAudio = useChapterAudio;
export type UseSurahCdnAudioOptions = UseChapterAudioOptions;
