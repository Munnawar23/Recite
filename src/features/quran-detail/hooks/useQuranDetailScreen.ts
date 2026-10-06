import {
  DEFAULT_TRANSLATION_ID,
  DEFAULT_TRANSLATION_ID_STRING,
} from "@/constants";
import { useActiveQuranDetail } from "@/features/quran-detail/hooks/useQuranDetail";
import { useQuranDetailScroll } from "@/features/quran-detail/hooks/useQuranDetailScroll";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import type { SurahVerse } from "@/types";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { withTiming } from "react-native-reanimated";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { RECITER_OPTIONS, useQuranAudio } from "../hooks/useQuranAudio";

const PLAYBACK_SEEK_OFFSET_SEC = 0.15;
const RESET_SELECTION_DELAY_MS = 800;
const INITIAL_SCROLL_DELAY_MS = 300;
const RESTORE_SCROLL_DELAY_MS = 100;
const PLAYER_SHOW_ANIMATION_MS = 250;

export function useQuranDetailScreen() {
  const { id, arabicName, englishName, versesCount, type, initialVerse } =
    useLocalSearchParams<{
      id: string;
      arabicName: string;
      englishName: string;
      versesCount: string;
      type: string;
      initialVerse?: string;
    }>();

  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const chapterId = parseInt(id ?? "1", 10);

  const translationId = useQuranSettingsStore((state) => state.translationId);
  const setTranslationId = useQuranSettingsStore(
    (state) => state.setTranslationId,
  );
  const selectedTransId = translationId || DEFAULT_TRANSLATION_ID_STRING;

  const queryTransId =
    selectedTransId === "0"
      ? DEFAULT_TRANSLATION_ID
      : parseInt(selectedTransId, 10);
  const {
    data: verses = [],
    isLoading,
    isError,
    refetch,
  } = useActiveQuranDetail("chapters", chapterId, queryTransId);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Audio playback
  const {
    player,
    status,
    activeVerseKey,
    isLoadingAudio,
    reciterId,
    timestamps = [],
    audioUrl,
    audioTotalBytes,
    isPlayingLocally,
  } = useQuranAudio(chapterId, true);

  const reciterName = useMemo(() => {
    const activeReciter = RECITER_OPTIONS.find((r) => r.id === reciterId);
    return activeReciter ? activeReciter.label : "Mishary Rashid Alafasy";
  }, [reciterId]);

  // Scroll animations & scroll-to-top
  const {
    listRef,
    scrollHandler,
    playerScrollTranslateY,
    isSelectingVerse,
    animatedHeaderStyle,
    animatedScrollTopStyle,
    showScrollTop,
    scrollToTop,
  } = useQuranDetailScroll({
    chapterId,
    isPlayingAudio: status?.playing,
  });

  const setLastRead = useReadingProgressStore((state) => state.setLastRead);
  const setVerseNumber = useReadingProgressStore(
    (state) => state.setVerseNumber,
  );
  const lastRead = useReadingProgressStore((state) => state.lastRead);

  const { isOffline } = useNetworkStatus();
  const safeArea = useAppSafeAreaInsets();

  // Record this surah as last read when screen opens
  useEffect(() => {
    if (englishName && chapterId) {
      setLastRead({
        surahNumber: chapterId,
        surahName: englishName,
        arabicName: arabicName ?? "",
        versesCount: versesCount ?? "",
        type: type ?? "",
        verseNumber: 1,
        scrollOffset: 0,
      });
    }
  }, [chapterId, englishName, arabicName, versesCount, type, setLastRead]);

  const handleVersePress = useCallback(
    (verseKey: string) => {
      playerScrollTranslateY.value = withTiming(0, {
        duration: PLAYER_SHOW_ANIMATION_MS,
      });
      isSelectingVerse.value = true;

      const index = verses.findIndex((v) => v.verseKey === verseKey);
      if (index !== -1) {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }

      const matchedTimestamp = timestamps.find(
        (ts) => ts.verse_key === verseKey,
      );
      if (matchedTimestamp && player) {
        player.seekTo(
          matchedTimestamp.timestamp_from / 1000 + PLAYBACK_SEEK_OFFSET_SEC,
        );
      }

      const timer = setTimeout(() => {
        isSelectingVerse.value = false;
      }, RESET_SELECTION_DELAY_MS);
      return () => clearTimeout(timer);
    },
    [verses, listRef, timestamps, player, playerScrollTranslateY, isSelectingVerse],
  );

  // Scroll to initial verse when opened from Continue Reading card
  useEffect(() => {
    if (initialVerse && verses.length > 0) {
      const targetVerseNum = parseInt(initialVerse, 10);
      const index = verses.findIndex(
        (v) => v.verseNumber === targetVerseNum || v.id === targetVerseNum,
      );
      if (index !== -1) {
        const timer = setTimeout(() => {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.2,
          });
        }, INITIAL_SCROLL_DELAY_MS);
        return () => clearTimeout(timer);
      }
    }
  }, [initialVerse, verses, listRef]);

  // Track topmost visible verse and update reading progress store
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: SurahVerse }> }) => {
      if (viewableItems.length > 0) {
        const topItem = viewableItems[0].item;
        if (topItem?.verseNumber) {
          setVerseNumber(chapterId, topItem.verseNumber);
        }
      }
    },
    [chapterId, setVerseNumber],
  );

  // Scroll to playing verse (only while actively playing)
  useEffect(() => {
    if (status?.playing && activeVerseKey && verses.length > 0) {
      const index = verses.findIndex((v) => v.verseKey === activeVerseKey);
      if (index !== -1) {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3,
        });
      }
    }
  }, [status?.playing, activeVerseKey, verses.length, listRef]);

  // Restore saved scroll position when re-opening the same surah
  useEffect(() => {
    const savedOffset =
      lastRead?.surahNumber === chapterId ? lastRead.scrollOffset : 0;
    if (!initialVerse && savedOffset > 0 && verses.length > 0) {
      const timer = setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: savedOffset,
          animated: false,
        });
      }, RESTORE_SCROLL_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [chapterId, initialVerse, lastRead, verses.length, listRef]);

  return {
    // Route params
    chapterId,
    arabicName,
    englishName,
    versesCount,
    type,
    // Theme
    colors,
    fontFamily,
    isDark,
    isOffline,
    topInset: safeArea.paddingTop,
    // Data
    verses,
    isLoading,
    isError,
    refetch,
    refreshing,
    onRefresh,
    // Translation
    selectedTransId,
    setTranslationId,
    // Audio
    player,
    status,
    isLoadingAudio,
    playerScrollTranslateY,
    activeVerseKey: activeVerseKey as string | null,
    reciterName,
    audioUrl,
    audioTotalBytes,
    isPlayingLocally,
    // Scroll
    listRef,
    scrollHandler,
    animatedHeaderStyle,
    animatedScrollTopStyle,
    showScrollTop,
    scrollToTop,
    // Verse interaction
    handleVersePress,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
