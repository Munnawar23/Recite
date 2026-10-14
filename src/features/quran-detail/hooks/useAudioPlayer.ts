import { useCallback, useEffect, useState } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedStyle } from "react-native-reanimated";
import type { AudioPlayer } from "expo-audio";

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
  status: any;
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
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(
    () => player?.playbackRate ?? 1.0,
  );
  const [isRepeating, setIsRepeating] = useState<boolean>(
    () => player?.loop ?? false,
  );

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

  // Sync slider with player's currentTime when user is not dragging
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(status?.currentTime || 0);
    }
  }, [status?.currentTime, isDragging]);

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
