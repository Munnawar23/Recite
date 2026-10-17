import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useTranslation } from "react-i18next";
import { Haptics } from "@/lib/haptics";
import {
  AR_CHAPTER_NAMES,
  CHAPTERS_METADATA,
  DEFAULT_RECITER_ID,
  RECITER_OPTIONS,
  AUDIO_RECITERS,
  DEFAULT_ENGLISH_RECITER_NAME,
  getChapter,
  getSurahName,
} from "@/constants";
import { useLanguageStore } from "@/store/languageStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useChapterAudio } from "./useChapterAudio";
import type { Chapter } from "@/types";

export interface UsePlayerModalParams {
  visible: boolean;
  onClose?: () => void;
  chapter?: Chapter | null;
  onChapterChange?: (chapter: Chapter) => void;
  audioLanguage?: "en" | "ar" | string;
}

export function usePlayerModal({
  visible,
  onClose,
  chapter,
  onChapterChange,
  audioLanguage,
}: UsePlayerModalParams) {
  const { height: screenHeight } = useWindowDimensions();
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const storeAudioLanguage = useQuranSettingsStore(
    (state) => state.audioLanguage,
  );
  const resolvedAudioLanguage =
    audioLanguage || storeAudioLanguage || (language === "ar" ? "ar" : "en");
  const isEnglish = resolvedAudioLanguage === "en";

  const [isReciterModalVisible, setIsReciterModalVisible] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [selectedEditionName, setSelectedEditionName] = useState<string>(
    DEFAULT_ENGLISH_RECITER_NAME,
  );

  // Reciter settings
  const reciterId = useQuranSettingsStore((state) => state.reciterId);
  const setReciterId = useQuranSettingsStore((state) => state.setReciterId);
  const activeReciterId = isEnglish
    ? DEFAULT_RECITER_ID
    : reciterId || DEFAULT_RECITER_ID;

  useEffect(() => {
    setAvatarError(false);
  }, [activeReciterId, selectedEditionName]);

  const currentReciter = useMemo(() => {
    if (isEnglish) {
      const audioReciter =
        AUDIO_RECITERS.find((r) => r.name === selectedEditionName) ||
        AUDIO_RECITERS[0];
      return {
        id: audioReciter.id ?? DEFAULT_RECITER_ID,
        label: audioReciter.label,
        avatar: audioReciter.avatar,
      };
    }
    return (
      RECITER_OPTIONS.find((r) => r.id === activeReciterId) ||
      RECITER_OPTIONS[0]
    );
  }, [isEnglish, selectedEditionName, activeReciterId]);

  const reciterDropdownItems = useMemo(() => {
    if (isEnglish) {
      return AUDIO_RECITERS.filter((r) => r.language === "en").map((r) => ({
        label: r.label,
        value: r.name,
        avatar: r.avatar,
      }));
    }
    return RECITER_OPTIONS.map((r) => ({
      label: r.label,
      value: String(r.id),
      avatar: r.avatar,
    }));
  }, [isEnglish]);

  const currentChapterId = chapter?.id ?? 1;

  const chapterMetadata = useMemo(() => {
    return (
      CHAPTERS_METADATA.find((m) => m.id === currentChapterId) ??
      CHAPTERS_METADATA[0]
    );
  }, [currentChapterId]);

  const localizedName = useMemo(() => {
    return chapter?.localizedName || getSurahName(currentChapterId, language);
  }, [chapter?.localizedName, currentChapterId, language]);

  const arabicName = useMemo(() => {
    return (
      chapter?.name ||
      AR_CHAPTER_NAMES[currentChapterId]?.name ||
      "الفاتحة"
    );
  }, [chapter?.name, currentChapterId]);

  const versesCount = chapter?.versesCount ?? chapterMetadata.versesCount;
  const chapterType = chapter?.type ?? chapterMetadata.type;
  const typeTranslationKey =
    chapterType.toLowerCase() === "medinan" ? "quran.medinan" : "quran.meccan";

  // Up Next Queue Calculation
  const nextChapterId = currentChapterId < 114 ? currentChapterId + 1 : 1;
  const nextSurahName = useMemo(() => {
    return getSurahName(nextChapterId, language);
  }, [nextChapterId, language]);

  const translateY = useSharedValue(screenHeight);
  const trackTranslateX = useSharedValue(0);
  const trackOpacity = useSharedValue(1);
  const isTransitioningRef = useRef(false);
  const changeFnRef = useRef<(() => void) | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, []);

  const resetTransition = useCallback(() => {
    isTransitioningRef.current = false;
  }, []);

  const onSlideOutComplete = useCallback(() => {
    if (changeFnRef.current) {
      changeFnRef.current();
      changeFnRef.current = null;
    }
    trackTranslateX.value = 36;
    trackTranslateX.value = withSpring(0, {
      damping: 20,
      stiffness: 180,
      mass: 0.8,
    });
    trackOpacity.value = withTiming(1, { duration: 220 });

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(resetTransition, 250);
  }, [trackTranslateX, trackOpacity, resetTransition]);

  // Reset track animation when modal opens
  useEffect(() => {
    if (visible) {
      trackTranslateX.value = 0;
      trackOpacity.value = 1;
      isTransitioningRef.current = false;
    }
  }, [visible, trackTranslateX, trackOpacity]);

  const saveProgressRef = useRef<(() => void) | null>(null);

  // Smooth slide-down exit animation
  const closePlayer = useCallback(() => {
    // Flush-save audio progress immediately when user initiates close
    if (saveProgressRef.current) {
      saveProgressRef.current();
    }
    translateY.value = withTiming(screenHeight, { duration: 240 }, () => {
      if (onClose) {
        scheduleOnRN(onClose);
      }
    });
  }, [onClose, translateY, screenHeight]);

  // Enter & exit animation based on visibility
  useEffect(() => {
    if (visible) {
      translateY.value = screenHeight;
      translateY.value = withSpring(0, {
        damping: 24,
        stiffness: 200,
        mass: 0.8,
      });
    } else {
      translateY.value = screenHeight;
    }
  }, [visible, translateY, screenHeight]);



  // Drag-to-dismiss pan gesture (memoized to prevent re-attaching on every audio status tick)
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([10, 1000])
        .failOffsetX([-15, 15])
        .onUpdate((event) => {
          if (event.translationY > 0) {
            translateY.value = event.translationY;
          }
        })
        .onEnd((event) => {
          if (event.translationY > 140 || event.velocityY > 500) {
            scheduleOnRN(closePlayer);
          } else {
            translateY.value = withSpring(0, {
              damping: 24,
              stiffness: 200,
              mass: 0.8,
            });
          }
        }),
    [translateY, closePlayer],
  );

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, screenHeight * 0.7],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const headerTitleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackTranslateX.value * 0.4 }],
    opacity: trackOpacity.value,
  }));

  const trackContentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackTranslateX.value }],
    opacity: trackOpacity.value,
  }));

  const animateTrackChange = useCallback(
    (changeFn: () => void) => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      Haptics.light();

      changeFnRef.current = changeFn;

      // 1. Slide current track slightly to the left and fade out
      trackTranslateX.value = withTiming(-36, { duration: 150 }, (finished) => {
        if (finished) {
          scheduleOnRN(onSlideOutComplete);
        } else {
          scheduleOnRN(resetTransition);
        }
      });
      trackOpacity.value = withTiming(0, { duration: 150 });
    },
    [onSlideOutComplete, resetTransition, trackTranslateX, trackOpacity],
  );

  const handlePlayNext = useCallback(() => {
    if (!onChapterChange) return;
    animateTrackChange(() => {
      const nextChapter = getChapter(nextChapterId, language);
      onChapterChange(nextChapter);
    });
  }, [animateTrackChange, nextChapterId, language, onChapterChange]);

  const audio = useChapterAudio({
    chapterId: currentChapterId,
    enabled: visible && !!chapter?.id,
    localizedName,
    arabicName,
    onPlayNext: handlePlayNext,
    audioLanguage: resolvedAudioLanguage,
    editionName: isEnglish ? selectedEditionName : undefined,
  });

  saveProgressRef.current = audio.saveProgress;

  const handleSelectReciter = useCallback(
    (value: string) => {
      Haptics.light();
      if (isEnglish) {
        setSelectedEditionName(value);
      } else {
        setReciterId(Number(value));
      }
    },
    [isEnglish, setReciterId],
  );

  return {
    // Modal animations & actions
    closePlayer,
    panGesture,
    animatedSheetStyle,
    animatedBackdropStyle,
    headerTitleAnimatedStyle,
    trackContentAnimatedStyle,

    // Chapter metadata
    currentChapterId,
    localizedName,
    arabicName,
    versesCount,
    typeTranslationKey,
    nextChapterId,
    nextSurahName,
    handlePlayNext,

    // Reciter state & actions
    isEnglish,
    selectedEditionName,
    activeReciterId,
    currentReciter,
    reciterDropdownItems,
    isReciterModalVisible,
    setIsReciterModalVisible,
    avatarError,
    setAvatarError,
    handleSelectReciter,

    // Audio controls
    audio,
  };
}
