import { useActiveQuranDetail } from "@/features/quran-detail/hooks/useQuranDetail";
import { useQuranDetailScroll } from "@/features/quran-detail/hooks/useQuranDetailScroll";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import type { SurahVerse } from "@/types/quran";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RefreshControl,
  RefreshControlProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";

import LottieView from "lottie-react-native";

// Sub-components & Custom Hooks
import AudioPlayerControls from "../components/AudioPlayerControls";
import DetailHeader from "../components/DetailHeader";
import QuranDetailHeaderSection from "../components/QuranDetailHeaderSection";
import ScrollTopButton from "../components/ScrollTopButton";
import VerseRow from "../components/VerseRow";
import { RECITER_OPTIONS, useQuranAudio } from "../hooks/useQuranAudio";

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList as unknown as React.ComponentType<any>,
);

const PLAYBACK_SEEK_OFFSET_SEC = 0.15;
const RESET_SELECTION_DELAY_MS = 800;
const INITIAL_SCROLL_DELAY_MS = 300;
const RESTORE_SCROLL_DELAY_MS = 100;
const PLAYER_SHOW_ANIMATION_MS = 250;

export default function QuranDetailScreen() {
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
  const selectedTransId = translationId || "20";

  const queryTransId =
    selectedTransId === "0" ? 20 : parseInt(selectedTransId, 10);
  const {
    data: apiVerses = [],
    isLoading: isApiLoading,
    isError: isApiError,
    refetch,
  } = useActiveQuranDetail("chapters", chapterId, queryTransId);

  const verses = apiVerses;
  const isLoading = isApiLoading;
  const isError = isApiError;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Audio Playback integration
  const {
    player,
    status,
    activeVerseKey,
    isLoadingAudio,
    reciterId,
    timestamps = [],
  } = useQuranAudio(chapterId, true);

  const activeReciter = RECITER_OPTIONS.find((r) => r.id === reciterId);
  const reciterName = activeReciter
    ? activeReciter.label
    : "Mishary Rashid Alafasy";

  // Scroll animations & scroll-to-top hook
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
  const isOfflineBannerShowing = isOffline;
  const insets = useSafeAreaInsets();

  const S = useMemo(
    () =>
      createStyles(
        colors,
        fontFamily,
        fontSize,
        insets.top,
        isOfflineBannerShowing,
      ),
    [colors, fontFamily, fontSize, insets.top, isOfflineBannerShowing],
  );

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
      // Bring audio player back into view when a verse is selected
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
    [
      verses,
      listRef,
      timestamps,
      player,
      playerScrollTranslateY,
      isSelectingVerse,
    ],
  );

  const renderVerse = useCallback(
    ({ item }: ListRenderItemInfo<SurahVerse>) => {
      const isActive = item.verseKey === activeVerseKey;
      return (
        <VerseRow
          item={item}
          selectedTransId={selectedTransId}
          isActive={isActive}
          onPress={() => handleVersePress(item.verseKey)}
        />
      );
    },
    [selectedTransId, activeVerseKey, handleVersePress],
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

  // Track the topmost visible verse and update the reading progress store
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
  }, [status?.playing, activeVerseKey, verses, listRef]);

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

  const renderHeader = useCallback(
    () => (
      <QuranDetailHeaderSection
        chapterId={chapterId}
        selectedTransId={selectedTransId}
        reciterName={reciterName}
        onTranslationChange={setTranslationId}
      />
    ),
    [chapterId, selectedTransId, reciterName, setTranslationId],
  );

  const refreshControl = useMemo(
    (): React.ReactElement<RefreshControlProps> => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
        progressViewOffset={verticalScale(60)}
      />
    ),
    [refreshing, onRefresh, colors.primary],
  );

  const keyExtractor = useCallback((item: SurahVerse) => String(item.id), []);

  const listContentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(67),
      paddingBottom: verticalScale(180),
    }),
    [],
  );

  const gradientColors = useMemo(
    () =>
      isDark
        ? [colors.background, colors.background]
        : [colors.primary + "08", colors.background],
    [isDark, colors.background, colors.primary],
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={S.centerContainer}>
          <LottieView
            source={require("@/../assets/animations/loading.json")}
            autoPlay
            loop
            style={S.lottieLoader}
          />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={S.centerContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={scale(52)}
            color={colors.subtext}
          />
          <Text style={S.errorTitle}>Failed to Load</Text>
          <Text style={S.errorSubtitle}>
            Check your internet connection and try again.
          </Text>
          <TouchableOpacity style={S.retryButton} onPress={() => refetch()}>
            <Text style={S.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <AnimatedFlashList
        ref={listRef}
        data={verses}
        renderItem={renderVerse}
        ListHeaderComponent={renderHeader}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        refreshControl={refreshControl}
        contentContainerStyle={listContentContainerStyle}
      />
    );
  };

  return (
    <View style={S.root}>
      <LinearGradient
        colors={gradientColors as [string, string]}
        style={StyleSheet.absoluteFill}
      />

      <View style={S.mainContainer}>
        <Animated.View style={[S.animatedHeaderContainer, animatedHeaderStyle]}>
          <DetailHeader
            chapterId={chapterId}
            arabicName={arabicName}
            englishName={englishName}
            versesCount={versesCount}
            type={type}
          />
        </Animated.View>

        {renderContent()}

        {player && status && (
          <AudioPlayerControls
            player={player}
            status={status}
            isLoadingAudio={isLoadingAudio}
            scrollTranslateY={playerScrollTranslateY}
          />
        )}

        <ScrollTopButton
          showScrollTop={showScrollTop}
          animatedScrollTopStyle={animatedScrollTopStyle}
          hasAudioPlayer={!!(player && status)}
          onPress={scrollToTop}
        />
      </View>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useAppTheme>["colors"],
  fontFamily: ReturnType<typeof useAppTheme>["fontFamily"],
  fontSize: ReturnType<typeof useAppTheme>["fontSize"],
  topInset: number,
  isOfflineBannerShowing: boolean,
) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    mainContainer: {
      flex: 1,
      paddingTop: isOfflineBannerShowing ? verticalScale(4) : topInset,
    },
    animatedHeaderContainer: {
      position: "absolute",
      top: isOfflineBannerShowing ? verticalScale(4) : topInset,
      left: 0,
      right: 0,
      zIndex: 20,
    },
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 0,
      paddingHorizontal: scale(32),
    },
    lottieLoader: {
      width: scale(200),
      height: scale(200),
      marginBottom: -verticalScale(10),
    },
    loadingText: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
    },
    errorTitle: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.title,
    },
    errorSubtitle: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      textAlign: "center",
      lineHeight: fontSize.body * 1.6,
    },
    retryButton: {
      marginTop: verticalScale(8),
      paddingHorizontal: scale(28),
      paddingVertical: verticalScale(10),
      backgroundColor: colors.primary,
      borderRadius: scale(20),
    },
    retryButtonText: {
      color: colors.card,
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
    },
  });
