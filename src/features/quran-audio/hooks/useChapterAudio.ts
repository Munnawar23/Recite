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
  const globalReciterId = useQuranSettingsStore((s) => s.reciterId);
  const reciterId = globalReciterId || DEFAULT_RECITER_ID;

  // Always fetch Arabic recitation audio online (same API as Quran Detail AudioPlayer)
  const {
    data: arabicAudioData,
    isLoading: isLoadingArabicAudio,
    isError: isErrorArabicAudio,
    refetch: refetchArabicAudio,
  } = useQuery({
    queryKey: ["chapter-audio", chapterId, reciterId],
    queryFn: () => getChapterAudio(chapterId, reciterId),
    enabled: enabled && isArabicAudio && !!chapterId && chapterId > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: Infinity,
    retry: 1,
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
  const playerSource = useMemo(
    () => (enabled && audioUrl ? { uri: audioUrl } : undefined),
    [enabled, audioUrl],
  );
  const player = useAudioPlayer(playerSource);
  const status = useAudioPlayerStatus(player);

  // Minimal UI state
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isChangingTrack, setIsChangingTrack] = useState<boolean>(true);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);

  // Tracking refs
  const loadedAudioUrlRef = useRef<string | null>(null);
  const isFirstRun = useRef<boolean>(true);
  const wasEnabledRef = useRef<boolean>(false);
  const seekTargetRef = useRef<number | null>(null);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHandledCompletionRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const shouldResetToZeroRef = useRef<boolean>(false);

  // Keep live refs fresh without re-running effects
  currentTimeRef.current = status?.currentTime ?? 0;
  isPlayingRef.current = Boolean(status?.playing);

  useEffect(() => {
    if (status?.duration != null && status.duration > 0) {
      durationRef.current = status.duration;
    }
  }, [status?.duration]);

  // Concurrency-safe: Clear seek target in effect, not render body
  useEffect(() => {
    if (
      seekTargetRef.current !== null &&
      Math.abs((status?.currentTime ?? 0) - seekTargetRef.current) < 1.0
    ) {
      seekTargetRef.current = null;
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
    }
  }, [status?.currentTime]);

  // Pure derived state: No useEffect, zero extra renders during normal playback
  const isDragging = dragValue !== null;
  const sliderValue = isChangingTrack
    ? (seekTargetRef.current ?? 0)
    : (dragValue ?? seekTargetRef.current ?? status?.currentTime ?? 0);

  // Cleanup seek timeout on unmount
  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
    };
  }, []);

  // Effect 1: Track switching and auto-play on modal open (prevents double-load on mount)
  useEffect(() => {
    if (!enabled || !audioUrl || !player) {
      wasEnabledRef.current = enabled;
      return;
    }

    const justOpened = !wasEnabledRef.current && enabled;
    wasEnabledRef.current = enabled;

    if (loadedAudioUrlRef.current === audioUrl) {
      if (justOpened && !player.playing) {
        player.play();
      }
      return;
    }

    // New track selected
    loadedAudioUrlRef.current = audioUrl;
    hasHandledCompletionRef.current = false;
    seekTargetRef.current = 0;
    currentTimeRef.current = 0;
    setDragValue(null);
    setIsChangingTrack(true);
    setHasTimedOut(false);
    shouldResetToZeroRef.current = true;

    try {
      if (isFirstRun.current) {
        // useAudioPlayer already loaded playerSource on mount
        isFirstRun.current = false;
      } else {
        player.replace({ uri: audioUrl });
        player.seekTo(0);
      }
      if (playbackSpeed !== 1.0) player.setPlaybackRate(playbackSpeed);
      if (isRepeating) player.loop = isRepeating;
      player.play();
    } catch {
      // Ignored if player released
    }
  }, [enabled, audioUrl, player, playbackSpeed, isRepeating]);

  // Effect 2: Clear isChangingTrack once track's duration is ready, and ensure seek to 0 lands
  useEffect(() => {
    const dur = status?.duration ?? 0;
    if ((dur > 0 && !status?.isBuffering) || status?.error) {
      if (shouldResetToZeroRef.current && player) {
        shouldResetToZeroRef.current = false;
        try {
          player.seekTo(0);
        } catch {}
      }
      setIsChangingTrack(false);
      setHasTimedOut(false);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    }
  }, [status?.duration, status?.isBuffering, status?.error, player]);

  // Effect 2b: Safety timeout (stops infinite spinner if user goes offline)
  useEffect(() => {
    if (!enabled) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      return;
    }

    const isReady = (status?.duration ?? 0) > 0 || status?.isLoaded || player?.isLoaded;
    if (isReady || status?.error || isErrorArabicAudio) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      return;
    }

    // Start 8-second timer when waiting to load
    if (!loadTimeoutRef.current) {
      loadTimeoutRef.current = setTimeout(() => {
        setHasTimedOut(true);
        setIsChangingTrack(false);
        loadTimeoutRef.current = null;
      }, 8000);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    };
  }, [enabled, status?.duration, status?.isLoaded, player?.isLoaded, status?.error, isErrorArabicAudio]);

  // Effect 3: Stop playback when modal closes
  useEffect(() => {
    if (!enabled && player && isPlayingRef.current) {
      try {
        player.pause();
      } catch {}
    }
  }, [enabled, player]);

  // Effect 4: Play next on track completion
  useEffect(() => {
    const isFinished =
      Boolean(status?.didJustFinish) ||
      status?.playbackState === "completed";

    if (isFinished) {
      if (!isRepeating && !hasHandledCompletionRef.current) {
        hasHandledCompletionRef.current = true;
        if (onPlayNext) onPlayNext();
      }
    } else if (hasHandledCompletionRef.current) {
      hasHandledCompletionRef.current = false;
    }
  }, [
    status?.didJustFinish,
    status?.playbackState,
    isRepeating,
    onPlayNext,
  ]);

  // Combined error and loading state with network protection
  const isFetchingAudio = isArabicAudio && isLoadingArabicAudio && !audioUrl;
  const isAudioError = Boolean(status?.error) || isErrorArabicAudio || hasTimedOut;
  const isDurationReady =
    (status?.duration ?? 0) > 0 ||
    (status?.isLoaded ?? false) ||
    (player?.isLoaded ?? false);
  const isLoading =
    enabled &&
    !isAudioError &&
    (isChangingTrack || isFetchingAudio || (!isDurationReady && !status?.error));

  // Control Handlers
  const handlePlayPause = useCallback(() => {
    Haptics.light();
    if (!player) return;
    try {
      if (status?.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch {}
  }, [player, status?.playing]);

  // Common Skip Backward 10s (immediate optimistic slider update + seek)
  const handleSkipBack = useCallback(() => {
    Haptics.light();
    if (!player) return;
    let current = currentTimeRef.current;
    try {
      if (typeof player.currentTime === "number" && !isNaN(player.currentTime)) {
        current = player.currentTime;
      }
    } catch {}
    const target = Math.max(0, current - 10);
    seekTargetRef.current = target;
    try {
      player.seekTo(target)?.catch?.(() => {});
    } catch {}
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    seekTimeoutRef.current = setTimeout(() => {
      seekTargetRef.current = null;
      seekTimeoutRef.current = null;
    }, 800);
  }, [player]);

  // Common Skip Forward 10s (immediate optimistic slider update + seek)
  const handleSkipForward = useCallback(() => {
    Haptics.light();
    if (!player) return;
    let current = currentTimeRef.current;
    let dur = durationRef.current;
    try {
      if (typeof player.currentTime === "number" && !isNaN(player.currentTime)) {
        current = player.currentTime;
      }
      if (typeof player.duration === "number" && player.duration > 0) {
        dur = player.duration;
      }
    } catch {}
    const target = dur > 0 ? Math.min(dur, current + 10) : current + 10;
    seekTargetRef.current = target;
    try {
      player.seekTo(target)?.catch?.(() => {});
    } catch {}
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
    }
    seekTimeoutRef.current = setTimeout(() => {
      seekTargetRef.current = null;
      seekTimeoutRef.current = null;
    }, 800);
  }, [player]);

  const cycleSpeed = useCallback(() => {
    Haptics.light();
    setPlaybackSpeed((prev) => {
      const next =
        prev === 1.0 ? 1.25 : prev === 1.25 ? 1.5 : prev === 1.5 ? 2.0 : 1.0;
      if (player) {
        try {
          player.setPlaybackRate(next);
        } catch {}
      }
      return next;
    });
  }, [player]);

  const toggleRepeat = useCallback(() => {
    Haptics.light();
    setIsRepeating((prev) => {
      const next = !prev;
      if (player) {
        try {
          player.loop = next;
        } catch {}
      }
      return next;
    });
  }, [player]);

  const handleSliderValueChange = useCallback((val: number) => {
    setDragValue(val);
  }, []);

  const handleSlidingComplete = useCallback(
    (val: number) => {
      seekTargetRef.current = val;
      setDragValue(null);
      try {
        player?.seekTo(val)?.catch?.(() => {});
      } catch {}
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
      seekTimeoutRef.current = setTimeout(() => {
        seekTargetRef.current = null;
        seekTimeoutRef.current = null;
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

  const retryAudioLoad = useCallback(() => {
    Haptics.light();
    setHasTimedOut(false);
    setIsChangingTrack(true);
    if (isArabicAudio) {
      refetchArabicAudio();
    }
    if (player && audioUrl) {
      try {
        player.replace({ uri: audioUrl });
        player.seekTo(0);
        player.play();
      } catch {}
    }
  }, [isArabicAudio, refetchArabicAudio, player, audioUrl]);

  return {
    player,
    status,
    audioUrl,
    remoteAudioUrl: audioUrl,
    reciterName,
    isArabicAudio,
    isEnglishAudio,
    isLoading,
    isAudioError,
    retryAudioLoad,
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
