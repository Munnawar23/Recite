import { Haptics } from "@/lib/haptics";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import { useCallback, useEffect, useRef, useState } from "react";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UseQuranDetailScrollParams {
  chapterId: number;
  isPlayingAudio?: boolean;
}

export function useQuranDetailScroll({
  chapterId,
  isPlayingAudio = false,
}: UseQuranDetailScrollParams) {
  const listRef = useRef<any>(null);

  const lastScrollY = useSharedValue(0);
  const playerScrollTranslateY = useSharedValue(0);
  const headerScrollTranslateY = useSharedValue(0);
  const isSelectingVerse = useSharedValue(false);
  const isScrollTopVisible = useSharedValue(false);
  const scrollTopOpacity = useSharedValue(0);
  const isPlayingAudioShared = useSharedValue(isPlayingAudio);

  useEffect(() => {
    isPlayingAudioShared.value = isPlayingAudio;
  }, [isPlayingAudio, isPlayingAudioShared]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { setScrollOffset } = useReadingProgressStore();

  const updateScrollTopVisibility = useCallback((visible: boolean) => {
    setShowScrollTop(visible);
  }, []);

  // Debounce helper — save scroll offset at most once per 500 ms
  const saveOffsetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveScrollOffset = useCallback(
    (offsetY: number) => {
      if (saveOffsetTimer.current) clearTimeout(saveOffsetTimer.current);
      saveOffsetTimer.current = setTimeout(() => {
        setScrollOffset(chapterId, offsetY);
      }, 500);
    },
    [chapterId, setScrollOffset],
  );

  const scrollToTop = useCallback(() => {
    Haptics.light();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const delta = currentY - lastScrollY.value;
      lastScrollY.value = currentY;

      if (currentY <= 300) {
        if (isScrollTopVisible.value) {
          isScrollTopVisible.value = false;
          scrollTopOpacity.value = withTiming(0, { duration: 200 });
          runOnJS(updateScrollTopVisibility)(false);
        }
        playerScrollTranslateY.value = withTiming(0, { duration: 200 });
        headerScrollTranslateY.value = withTiming(0, { duration: 200 });
      } else if (delta > 6) {
        if (isScrollTopVisible.value) {
          isScrollTopVisible.value = false;
          scrollTopOpacity.value = withTiming(0, { duration: 200 });
          runOnJS(updateScrollTopVisibility)(false);
        }
        headerScrollTranslateY.value = withTiming(-120, { duration: 250 });
        if (!isPlayingAudioShared.value && !isSelectingVerse.value) {
          playerScrollTranslateY.value = withTiming(200, { duration: 250 });
        } else {
          playerScrollTranslateY.value = withTiming(0, { duration: 200 });
        }
      } else if (delta < -6) {
        if (!isScrollTopVisible.value) {
          isScrollTopVisible.value = true;
          scrollTopOpacity.value = withTiming(1, { duration: 200 });
          runOnJS(updateScrollTopVisibility)(true);
        }
        playerScrollTranslateY.value = withTiming(0, { duration: 250 });
        headerScrollTranslateY.value = withTiming(0, { duration: 250 });
      }
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerScrollTranslateY.value }],
  }));

  const animatedScrollTopStyle = useAnimatedStyle(() => ({
    opacity: scrollTopOpacity.value,
    transform: [{ scale: scrollTopOpacity.value }],
  }));

  return {
    listRef,
    scrollHandler,
    playerScrollTranslateY,
    isSelectingVerse,
    animatedHeaderStyle,
    animatedScrollTopStyle,
    showScrollTop,
    scrollToTop,
  };
}
