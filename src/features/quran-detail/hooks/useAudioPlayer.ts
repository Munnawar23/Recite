import { useCallback, useEffect, useRef, useState } from "react";
import type { SharedValue } from "react-native-reanimated";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import type { AudioPlayer, AudioStatus } from "expo-audio";

import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds == null || seconds < 0 || !Number.isFinite(seconds)) return "0:00";
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
  const currentTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  // Keep latest currentTime & duration in refs to avoid rebuilding callbacks on every tick
  useEffect(() => {
    if (status?.currentTime != null) {
      currentTimeRef.current = status.currentTime;
    }
  }, [status?.currentTime]);

  useEffect(() => {
    if (status?.duration != null && status.duration > 0) {
      durationRef.current = status.duration;
    }
  }, [status?.duration]);

  // Clear seek target once player's currentTime catches up near the target
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

  // Pure derived state: No extra renders during normal playback
  const isDragging = dragValue !== null;
  const sliderValue = dragValue ?? seekTargetRef.current ?? status?.currentTime ?? 0;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
    };
  }, []);

  // When player instance changes, sync current speed & repeat preferences to it
  useEffect(() => {
    if (player) {
      try {
        player.setPlaybackRate(playbackSpeed);
        player.loop = isRepeating;
      } catch {}
    }
  }, [player]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep loader active until duration or player is ready, bail out if there's an error
  const isDurationReady =
    (status?.duration ?? 0) > 0 ||
    (status?.isLoaded ?? false) ||
    (player?.isLoaded ?? false);
  const isPlayerLoading = isLoadingAudio || (!isDurationReady && !status?.error);

  // Common Play / Pause
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

  // Common Skip Backward 10s (stable callback, reads player or currentTime ref)
  const handleSkipBack = useCallback(() => {
    Haptics.light();
    if (!player) return;
    const ct =
      typeof player.currentTime === "number" && !isNaN(player.currentTime)
        ? player.currentTime
        : currentTimeRef.current;
    try {
      player.seekTo(Math.max(0, ct - 10))?.catch?.(() => {});
    } catch {}
  }, [player]);

  // Common Skip Forward 10s (safe duration calculation: never seeks to 0 on unknown duration)
  const handleSkipForward = useCallback(() => {
    Haptics.light();
    if (!player) return;
    const ct =
      typeof player.currentTime === "number" && !isNaN(player.currentTime)
        ? player.currentTime
        : currentTimeRef.current;
    const dur =
      typeof player.duration === "number" && player.duration > 0
        ? player.duration
        : durationRef.current;
    const target = dur > 0 ? Math.min(dur, ct + 10) : ct + 10;
    try {
      player.seekTo(target)?.catch?.(() => {});
    } catch {}
  }, [player]);

  // Common Speed Cycle: 1.0 -> 1.25 -> 1.5 -> 2.0 -> 1.0
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

  // Common Repeat / Loop Toggle
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

  // Slider change handlers
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

  // Track playing state in a SharedValue for thread-safe worklet animation
  const isPlayingSV = useSharedValue(Boolean(status?.playing));
  useEffect(() => {
    isPlayingSV.value = Boolean(status?.playing);
  }, [status?.playing, isPlayingSV]);

  // Mini-player scroll hide/show animation
  const miniPlayerAnimatedStyle = useAnimatedStyle(() => {
    const scrollOffset = scrollTranslateY ? scrollTranslateY.value : 0;
    const effectiveOffset = isPlayingSV.value ? 0 : scrollOffset;
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
