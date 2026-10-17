import {
  DEFAULT_TRANSLATION_ID,
  DEFAULT_TRANSLATION_ID_STRING,
  getChapter,
} from "@/constants";
import { useActiveQuranDetail } from "@/features/quran-detail/hooks/useQuranDetail";
import { useQuranDetailScroll } from "@/features/quran-detail/hooks/useQuranDetailScroll";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLanguageStore } from "@/store/languageStore";
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
  const { id, arabicName, localizedName, versesCount, type, initialVerse } =
    useLocalSearchParams<{
      id: string;
      arabicName: string;
      localizedName?: string;
      versesCount: string;
      type: string;
      initialVerse?: string;
    }>();

  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const chapterId = parseInt(id ?? "1", 10);

  const language = useLanguageStore((state) => state.language);
  const chapterFallback = useMemo(
    () => (chapterId ? getChapter(chapterId, language) : null),
    [chapterId, language],
  );
  const resolvedLocalizedName =
    localizedName || chapterFallback?.localizedName || "";
  const resolvedArabicName = arabicName || chapterFallback?.name || "";

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
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const audioMetadataOptions = useMemo(
    () => ({
      localizedName: resolvedLocalizedName,
      arabicName: resolvedArabicName,
    }),
    [resolvedLocalizedName, resolvedArabicName],
  );

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
  } = useQuranAudio(chapterId, true, audioMetadataOptions);

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

  const safeArea = useAppSafeAreaInsets();

  // Record this surah as last read when screen opens
  useEffect(() => {
    if (chapterId) {
      const currentLastRead = useReadingProgressStore.getState().lastRead;
      const parsedInitial = initialVerse ? parseInt(initialVerse, 10) : NaN;
      const initialVerseNum =
        !isNaN(parsedInitial) && parsedInitial > 0
          ? parsedInitial
          : currentLastRead?.surahNumber === chapterId
            ? currentLastRead.verseNumber
            : 1;

      setLastRead({
        surahNumber: chapterId,
        surahName: resolvedLocalizedName,
        arabicName: resolvedArabicName,
        versesCount: versesCount ?? String(chapterFallback?.versesCount ?? ""),
        type: type ?? chapterFallback?.type ?? "",
        verseNumber: initialVerseNum,
        scrollOffset:
          currentLastRead?.surahNumber === chapterId
            ? currentLastRead.scrollOffset
            : 0,
      });
    }
  }, [
    chapterId,
    resolvedLocalizedName,
    resolvedArabicName,
    versesCount,
    type,
    initialVerse,
    setLastRead,
    chapterFallback,
  ]);

  const selectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up selection timer on unmount
  useEffect(() => {
    return () => {
      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
        selectionTimerRef.current = null;
      }
    };
  }, []);

  const handleVersePress = useCallback(
    (verseKey: string) => {
      setHighlightedVerseKey(null);
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

      if (selectionTimerRef.current) {
        clearTimeout(selectionTimerRef.current);
      }
      selectionTimerRef.current = setTimeout(() => {
        isSelectingVerse.value = false;
        selectionTimerRef.current = null;
      }, RESET_SELECTION_DELAY_MS);
    },
    [verses, listRef, timestamps, player, playerScrollTranslateY, isSelectingVerse],
  );

  // Scroll to initial verse when opened from Continue Reading or Favorite Verse card
  useEffect(() => {
    if (initialVerse && verses.length > 0) {
      const targetVerseNum = parseInt(initialVerse, 10);
      const index = verses.findIndex(
        (v) => v.verseNumber === targetVerseNum || v.id === targetVerseNum,
      );
      if (index !== -1) {
        const targetVerseKey = verses[index].verseKey;
        const scrollTimer = setTimeout(() => {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.2,
          });
          setHighlightedVerseKey(targetVerseKey);
        }, INITIAL_SCROLL_DELAY_MS);

        // Keep highlight visible for 3.5s so user spots it easily, then gently clear
        const highlightTimer = setTimeout(() => {
          setHighlightedVerseKey((current) =>
            current === targetVerseKey ? null : current,
          );
        }, INITIAL_SCROLL_DELAY_MS + 3500);

        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(highlightTimer);
        };
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

  // Track the last verse we auto-scrolled to, so user can freely scroll while
  // a verse is playing without being continuously snapped back to it.
  const lastScrolledVerseKeyRef = useRef<string | null>(null);
  const hasRestoredScrollRef = useRef<boolean>(false);

  useEffect(() => {
    lastScrolledVerseKeyRef.current = null;
    hasRestoredScrollRef.current = false;
  }, [chapterId]);

  // Scroll to playing verse ONLY when activeVerseKey transitions to a new verse
  useEffect(() => {
    if (status?.playing && activeVerseKey && verses.length > 0) {
      if (lastScrolledVerseKeyRef.current !== activeVerseKey) {
        lastScrolledVerseKeyRef.current = activeVerseKey;
        const index = verses.findIndex((v) => v.verseKey === activeVerseKey);
        if (index !== -1) {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
        }
      }
    }
  }, [status?.playing, activeVerseKey, verses.length, listRef]);

  // Restore saved scroll position ONCE when re-opening the surah (not on every scroll save)
  useEffect(() => {
    if (hasRestoredScrollRef.current) return;
    const currentLastRead = useReadingProgressStore.getState().lastRead;
    const savedOffset =
      currentLastRead?.surahNumber === chapterId
        ? currentLastRead.scrollOffset
        : 0;

    if (!initialVerse && savedOffset > 0 && verses.length > 0) {
      hasRestoredScrollRef.current = true;
      const timer = setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: savedOffset,
          animated: false,
        });
      }, RESTORE_SCROLL_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [chapterId, initialVerse, verses.length, listRef]);

  return {
    // Route params
    chapterId,
    arabicName: resolvedArabicName,
    localizedName: resolvedLocalizedName,
    localizedTranslation: chapterFallback?.localizedTranslation ?? "",
    versesCount: versesCount ?? String(chapterFallback?.versesCount ?? ""),
    type: type ?? chapterFallback?.type ?? "",
    // Theme
    colors,
    fontFamily,
    isDark,
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
    activeVerseKey: (activeVerseKey || highlightedVerseKey) as string | null,
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
