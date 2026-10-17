import { useCallback, useEffect, useRef, useState } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedStyle } from "react-native-reanimated";
import type { AudioPlayer, AudioStatus } from "expo-audio";

import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds == null || seconds < 0) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export interface UseAudioPlayerParams {
  player: AudioPlayer | null;
  status: AudioStatus | null;
  isLoadingAudio: boolean;
  scrollTranslateY?: SharedValue<number>;
}

export function useAudioPlayer({
  player,
  status,
  isLoadingAudio,
  scrollTranslateY,
}: UseAudioPlayerParams) {
  const { colors, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  // Playback controls state
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(
    () => player?.playbackRate ?? 1.0,
  );
  const [isRepeating, setIsRepeating] = useState<boolean>(
    () => player?.loop ?? false,
  );

  const seekTargetRef = useRef<number | null>(null);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Keep speed and repeat in sync
  useEffect(() => {
    if (player?.playbackRate != null && player.playbackRate !== playbackSpeed) {
      setPlaybackSpeed(player.playbackRate);
    }
  }, [player?.playbackRate, playbackSpeed]);

  useEffect(() => {
    if (player?.loop != null && player.loop !== isRepeating) {
      setIsRepeating(player.loop);
    }
  }, [player?.loop, isRepeating]);

  // Keep loader active until duration is known
  const isDurationReady = (status?.duration ?? 0) > 0;
  const isPlayerLoading = isLoadingAudio || !isDurationReady;

  // Common Play / Pause
  const handlePlayPause = useCallback(() => {
    Haptics.light();
    if (!player) return;
    if (status?.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, status?.playing]);

  // Common Skip Backward 10s
  const handleSkipBack = useCallback(() => {
    Haptics.light();
    if (!player) return;
    player.seekTo(Math.max(0, (status?.currentTime || 0) - 10));
  }, [player, status?.currentTime]);

  // Common Skip Forward 10s
  const handleSkipForward = useCallback(() => {
    Haptics.light();
    if (!player) return;
    player.seekTo(
      Math.min(status?.duration || 0, (status?.currentTime || 0) + 10),
    );
  }, [player, status?.currentTime, status?.duration]);

  // Common Speed Cycle: 1.0 -> 1.25 -> 1.5 -> 2.0 -> 1.0
  const cycleSpeed = useCallback(() => {
    Haptics.light();
    const currentSpeed = player?.playbackRate ?? playbackSpeed;
    const nextSpeed =
      currentSpeed === 1.0
        ? 1.25
        : currentSpeed === 1.25
          ? 1.5
          : currentSpeed === 1.5
            ? 2.0
            : 1.0;
    setPlaybackSpeed(nextSpeed);
    if (player) {
      player.setPlaybackRate(nextSpeed);
    }
  }, [player, playbackSpeed]);

  // Common Repeat / Loop Toggle
  const toggleRepeat = useCallback(() => {
    Haptics.light();
    const next = !(player?.loop ?? isRepeating);
    setIsRepeating(next);
    if (player) {
      player.loop = next;
    }
  }, [player, isRepeating]);

  // Slider change handlers
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

  // Mini-player scroll hide/show animation
  const miniPlayerAnimatedStyle = useAnimatedStyle(() => {
    const scrollOffset = scrollTranslateY ? scrollTranslateY.value : 0;
    const effectiveOffset = status?.playing ? 0 : scrollOffset;
    return {
      transform: [{ translateY: effectiveOffset }],
    };
  });

  return {
    colors,
    isDark,
    sliderValue,
    isDragging,
    playbackSpeed,
    isRepeating,
    isDurationReady,
    isPlayerLoading,
    isPlayerBusy: isPlayerLoading,
    handlePlayPause,
    handleSkipBack,
    handleSkipForward,
    cycleSpeed,
    toggleRepeat,
    handleSliderValueChange,
    handleSlidingComplete,
    miniPlayerAnimatedStyle,
  };
}
