import { Haptics } from "@/lib/haptics";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import type { SurahVerse } from "@/types";
import type { FlashListRef } from "@shopify/flash-list";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export const HEADER_HIDE_OFFSET = -120;
export const PLAYER_HIDE_OFFSET = 200;
const SCROLL_DELTA_THRESHOLD = 6;
const TOP_SCROLL_THRESHOLD = 300;

/**
 * Animate a SharedValue to target only when it is not already settled near target.
 * Prevents re-creating and restarting withTiming loops on every frame while scrolling.
 */
const animateTo = (
  sv: { value: number },
  target: number,
  duration: number,
) => {
  "worklet";
  if (Math.abs(sv.value - target) > 0.5) {
    sv.value = withTiming(target, { duration });
  }
};

interface UseQuranDetailScrollParams {
  chapterId: number;
  isPlayingAudio?: boolean;
}

export function useQuranDetailScroll({
  chapterId,
  isPlayingAudio = false,
}: UseQuranDetailScrollParams) {
  const listRef = useRef<FlashListRef<SurahVerse> | null>(null);

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

  // Selector prevents re-renders when other reading progress state changes
  const setScrollOffset = useReadingProgressStore((s) => s.setScrollOffset);

  const updateScrollTopVisibility = useCallback((visible: boolean) => {
    setShowScrollTop(visible);
  }, []);

  // Debounced scroll offset saving (max once per 500ms)
  const saveOffsetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveScrollOffset = useCallback(
    (offsetY: number) => {
      if (saveOffsetTimer.current) {
        clearTimeout(saveOffsetTimer.current);
      }
      saveOffsetTimer.current = setTimeout(() => {
        setScrollOffset(chapterId, offsetY);
        saveOffsetTimer.current = null;
      }, 500);
    },
    [chapterId, setScrollOffset],
  );

  // Cleanup pending debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveOffsetTimer.current) {
        clearTimeout(saveOffsetTimer.current);
        saveOffsetTimer.current = null;
      }
    };
  }, []);

  // Flush timer and reset scroll tracking state on chapter change
  const prevChapterIdRef = useRef(chapterId);
  useEffect(() => {
    if (prevChapterIdRef.current !== chapterId) {
      if (saveOffsetTimer.current) {
        clearTimeout(saveOffsetTimer.current);
        saveOffsetTimer.current = null;
      }
      prevChapterIdRef.current = chapterId;

      // Clean slate on chapter change
      lastScrollY.value = 0;
      isScrollTopVisible.value = false;
      scrollTopOpacity.value = 0;
      playerScrollTranslateY.value = 0;
      headerScrollTranslateY.value = 0;
      setShowScrollTop(false);
    }
  }, [
    chapterId,
    headerScrollTranslateY,
    isScrollTopVisible,
    lastScrollY,
    playerScrollTranslateY,
    scrollTopOpacity,
  ]);

  const scrollToTop = useCallback(() => {
    Haptics.light();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const delta = currentY - lastScrollY.value;
      lastScrollY.value = currentY;

      // Persist scroll offset debounced
      scheduleOnRN(saveScrollOffset, currentY);

      if (currentY <= TOP_SCROLL_THRESHOLD) {
        if (isScrollTopVisible.value) {
          isScrollTopVisible.value = false;
          scrollTopOpacity.value = withTiming(0, { duration: 200 });
          scheduleOnRN(updateScrollTopVisibility, false);
        }
        animateTo(playerScrollTranslateY, 0, 200);
        animateTo(headerScrollTranslateY, 0, 200);
      } else if (delta > SCROLL_DELTA_THRESHOLD) {
        if (isScrollTopVisible.value) {
          isScrollTopVisible.value = false;
          scrollTopOpacity.value = withTiming(0, { duration: 200 });
          scheduleOnRN(updateScrollTopVisibility, false);
        }
        animateTo(headerScrollTranslateY, HEADER_HIDE_OFFSET, 250);
        if (!isPlayingAudioShared.value && !isSelectingVerse.value) {
          animateTo(playerScrollTranslateY, PLAYER_HIDE_OFFSET, 250);
        } else {
          animateTo(playerScrollTranslateY, 0, 200);
        }
      } else if (delta < -SCROLL_DELTA_THRESHOLD) {
        if (!isScrollTopVisible.value) {
          isScrollTopVisible.value = true;
          scrollTopOpacity.value = withTiming(1, { duration: 200 });
          scheduleOnRN(updateScrollTopVisibility, true);
        }
        animateTo(playerScrollTranslateY, 0, 250);
        animateTo(headerScrollTranslateY, 0, 250);
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
