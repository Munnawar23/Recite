import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  type AudioMetadata,
} from "expo-audio";

import { getSurahCdnAudioUrl } from "@/lib/api/surah-cdn-audio";
import { useBackgroundPlay } from "@/hooks/useBackgroundPlay";
import { Haptics } from "@/lib/haptics";

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
  // 1. Audio source URL
  const audioUrl = useMemo(() => {
    if (!chapterId || chapterId < 1 || chapterId > 114) return null;
    return getSurahCdnAudioUrl(chapterId);
  }, [chapterId]);

  // 2. Initialize expo-audio player
  const player = useAudioPlayer(
    enabled && audioUrl ? { uri: audioUrl } : undefined,
  );
  const status = useAudioPlayerStatus(player);

  // Minimal UI state
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [isChangingTrack, setIsChangingTrack] = useState<boolean>(true);

  // Tracking refs
  const loadedAudioUrlRef = useRef<string | null>(null);
  const wasEnabledRef = useRef<boolean>(false);

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
    setIsChangingTrack(true);
    player.replace({ uri: audioUrl });
    player.play();
  }, [enabled, audioUrl, player]);

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

  // Effect 4: Play next on track completion
  useEffect(() => {
    if (
      status?.duration &&
      status.duration > 0 &&
      (status.playbackState === "completed" ||
        (status.currentTime >= status.duration - 0.5 && status.duration > 5))
    ) {
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
    setIsDragging(true);
    setSliderValue(val);
  }, []);

  const handleSlidingComplete = useCallback(
    (val: number) => {
      player?.seekTo(val);
      setIsDragging(false);
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

  return {
    player,
    status,
    audioUrl,
    remoteAudioUrl: audioUrl,
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
