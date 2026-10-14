import { useCallback, useEffect, useMemo, useState } from "react";
import { BackHandler, Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useRouter } from "expo-router";
import type { AudioPlayer } from "expo-audio";

import { getLocalizedSurah, RECITER_OPTIONS } from "@/constants";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  // Modal-specific params
  visible?: boolean;
  onClose?: () => void;
  onDismissToTabs?: () => void;
  onDismissToDetail?: () => void;
  chapterId?: number;
  arabicName?: string;
  englishName?: string;
  reciterName?: string;
  // Mini player specific params
  scrollTranslateY?: SharedValue<number>;
  onMusicPress?: () => void;
}

export function useAudioPlayer({
  player,
  status,
  isLoadingAudio,
  visible,
  onClose,
  onDismissToTabs,
  onDismissToDetail,
  chapterId = 1,
  arabicName,
  englishName,
  reciterName,
  scrollTranslateY,
  onMusicPress,
}: UseAudioPlayerParams) {
  const router = useRouter();
  const { colors, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  // Shared playback controls state
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(
    () => player?.playbackRate ?? 1.0,
  );
  const [isRepeating, setIsRepeating] = useState<boolean>(
    () => player?.loop ?? false,
  );

  // Keep speed and repeat in sync if altered from another component/player instance
  useEffect(() => {
    if (player?.playbackRate != null && player.playbackRate !== playbackSpeed) {
      setPlaybackSpeed(player.playbackRate);
    }
  }, [player?.playbackRate]);

  useEffect(() => {
    if (player?.loop != null && player.loop !== isRepeating) {
      setIsRepeating(player.loop);
    }
  }, [player?.loop]);

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

  // Mini-player music button handler
  const handleMusicPress = useCallback(() => {
    Haptics.light();
    onMusicPress?.();
  }, [onMusicPress]);

  // Mini-player scroll hide/show animation
  const miniPlayerAnimatedStyle = useAnimatedStyle(() => {
    const scrollOffset = scrollTranslateY ? scrollTranslateY.value : 0;
    const effectiveOffset = status?.playing ? 0 : scrollOffset;
    return {
      transform: [{ translateY: effectiveOffset }],
    };
  });

  // --- Modal Specific Logic ---
  const translateY = useSharedValue(SCREEN_HEIGHT);

  // Action when user wants to navigate back to bottom tabs (chevron-back, Android back)
  // Directly navigate to tabs without closing animation to prevent seeing QuranDetailScreen glitch
  const dismissToTabs = useCallback(() => {
    if (onDismissToTabs) {
      onDismissToTabs();
    } else if (onClose) {
      onClose();
    }
  }, [onDismissToTabs, onClose]);

  // Action when user taps the top-right cross icon (close modal, show Quran detail)
  const closeToDetail = useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
      if (onDismissToDetail) {
        scheduleOnRN(onDismissToDetail);
      } else if (onClose) {
        scheduleOnRN(onClose);
      }
    });
  }, [onDismissToDetail, onClose, translateY]);

  // Default closePlayer for backwards compatibility
  const closePlayer = dismissToTabs;

  // Enter / Exit spring animation for modal
  useEffect(() => {
    if (visible === undefined) return;
    if (visible) {
      translateY.value = SCREEN_HEIGHT;
      translateY.value = withSpring(0, {
        damping: 24,
        stiffness: 200,
        mass: 0.8,
      });
    } else {
      translateY.value = SCREEN_HEIGHT;
    }
  }, [visible, translateY]);

  // Android hardware back button handler: goes directly to bottom tabs
  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      dismissToTabs();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [visible, dismissToTabs]);

  // Pan gesture to drag down and close modal (reveals Quran detail screen, just like cross button)
  const panGesture = Gesture.Pan()
    .activeOffsetY([10, 1000])
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 140 || event.velocityY > 500) {
        scheduleOnRN(closeToDetail);
      } else {
        translateY.value = withSpring(0, {
          damping: 24,
          stiffness: 200,
          mass: 0.8,
        });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT * 0.7],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Reciter & Localization
  const language = useLanguageStore((state) => state.language);
  const reciterId = useQuranSettingsStore((state) => state.reciterId);

  const selectedReciter = useMemo(
    () =>
      RECITER_OPTIONS.find((r) => r.id === reciterId) ??
      RECITER_OPTIONS.find((r) => r.label === reciterName) ??
      RECITER_OPTIONS[0],
    [reciterId, reciterName],
  );

  const localizedSurah = useMemo(
    () =>
      getLocalizedSurah(
        chapterId,
        language,
        englishName || `Surah ${chapterId}`,
        "",
        arabicName || "",
      ),
    [chapterId, language, englishName, arabicName],
  );

  const nextChapterId = useMemo(
    () => (chapterId < 114 ? chapterId + 1 : 1),
    [chapterId],
  );

  const nextSurah = useMemo(
    () =>
      getLocalizedSurah(
        nextChapterId,
        language,
        `Surah ${nextChapterId}`,
        "",
        "",
      ),
    [nextChapterId, language],
  );

  const handlePlayNext = useCallback(() => {
    Haptics.light();
    closePlayer();
    router.replace({
      pathname: "/quran-detail/[id]" as const,
      params: {
        id: String(nextChapterId),
        arabicName: "",
        englishName: nextSurah.name,
        versesCount: "",
        type: "",
      },
    });
  }, [closePlayer, nextChapterId, nextSurah.name, router]);

  // Linear Gradient Color Palettes
  const primaryGradientColors = useMemo(
    () =>
      isDark
        ? (["#0B1B15", "#06120E", "#030806"] as const)
        : (["#E8F5ED", "#F3F8F5", "#FFFFFF"] as const),
    [isDark],
  );

  const depthOverlayColors = useMemo(
    () =>
      isDark
        ? ([
            "rgba(11, 27, 21, 0.45)",
            "rgba(6, 18, 14, 0.75)",
            "rgba(3, 8, 6, 0.95)",
          ] as const)
        : ([
            "rgba(232, 245, 237, 0.5)",
            "rgba(243, 248, 245, 0.8)",
            "rgba(255, 255, 255, 0.96)",
          ] as const),
    [isDark],
  );

  return {
    colors,
    isDark,
    // Playback state
    sliderValue,
    isDragging,
    playbackSpeed,
    isRepeating,
    isDurationReady,
    isPlayerLoading,
    isPlayerBusy: isPlayerLoading,
    // Playback handlers
    handlePlayPause,
    handleSkipBack,
    handleSkipForward,
    cycleSpeed,
    toggleRepeat,
    handleSliderValueChange,
    handleSlidingComplete,
    // Mini-player specific
    handleMusicPress,
    miniPlayerAnimatedStyle,
    // Modal specific
    closePlayer,
    dismissToTabs,
    closeToDetail,
    panGesture,
    animatedSheetStyle,
    animatedBackdropStyle,
    selectedReciter,
    localizedSurah,
    nextSurah,
    nextChapterId,
    handlePlayNext,
    primaryGradientColors,
    depthOverlayColors,
  };
}
