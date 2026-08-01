import { useActiveQuranDetail } from "@/features/quran/hooks/useQuranDetail";
import { useQuranDetailScroll } from "@/features/quran/hooks/useQuranDetailScroll";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import type { SurahVerse } from "@/types/quran";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, verticalScale } from "react-native-size-matters";

// Sub-components & Custom Hooks
import AudioPlayerControls from "../components/AudioPlayerControls";
import DetailHeader from "../components/DetailHeader";
import QuranDetailHeaderSection from "../components/QuranDetailHeaderSection";
import ScrollTopButton from "../components/ScrollTopButton";
import VerseRow from "../components/VerseRow";
import { RECITER_OPTIONS, useQuranAudio } from "../hooks/useQuranAudio";

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList as any);

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

  const { translationId, setTranslationId } = useQuranSettingsStore();
  const selectedTransId = translationId || "20";

  const { downloadedChapters, getDownloadedChapter } = useDownloadsStore();
  const { reciterId: currentReciterId } = useQuranSettingsStore();
  const localChapter = getDownloadedChapter(chapterId, currentReciterId || 7);
  const isDownloaded = !!localChapter;

  const queryTransId =
    selectedTransId === "0" ? 20 : parseInt(selectedTransId, 10);
  const {
    data: apiVerses = [],
    isLoading: isApiLoading,
    isError: isApiError,
    refetch,
  } = useActiveQuranDetail("chapters", chapterId, queryTransId);

  const verses = isDownloaded
    ? localChapter.versesByTranslation?.[queryTransId] || localChapter.verses
    : apiVerses;
  const isLoading = isDownloaded ? false : isApiLoading;
  const isError = isDownloaded ? false : isApiError;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

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

  const { setLastRead, setVerseNumber, lastRead } = useReadingProgressStore();

  const { isOffline } = useNetworkStatus();
  const isOfflineBannerShowing = isOffline && !isDownloaded;
  const insets = useSafeAreaInsets();

  const S = createStyles(
    colors,
    fontFamily,
    fontSize,
    isDark,
    insets.top,
    isOfflineBannerShowing,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const handleVersePress = useCallback(
    (verseKey: string) => {
      // Bring audio player back into view when a verse is selected
      playerScrollTranslateY.value = withTiming(0, { duration: 250 });
      isSelectingVerse.value = true;

      const matchedTimestamp = timestamps.find(
        (ts) => ts.verse_key === verseKey,
      );
      if (matchedTimestamp && player) {
        player.seekTo((matchedTimestamp.timestamp_from + 150) / 1000);
      }

      setTimeout(() => {
        isSelectingVerse.value = false;
      }, 800);
    },
    [timestamps, player, playerScrollTranslateY, isSelectingVerse],
  );

  const renderVerse = useCallback(
    ({ item }: { item: SurahVerse }) => {
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
        setTimeout(() => {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.2,
          });
        }, 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVerse, verses.length]);

  // Track the topmost visible verse and update the reading progress store
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        const topItem = viewableItems[0].item as SurahVerse;
        if (topItem?.verseNumber) {
          setVerseNumber(chapterId, topItem.verseNumber);
        }
      }
    },
    [chapterId, setVerseNumber],
  );

  // Scroll to playing verse
  useEffect(() => {
    if (activeVerseKey && verses.length > 0) {
      const index = verses.findIndex((v) => v.verseKey === activeVerseKey);
      if (index !== -1) {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3,
        });
      }
    }
  }, [activeVerseKey, verses]);

  // Restore saved scroll position when re-opening the same surah
  useEffect(() => {
    const savedOffset =
      lastRead?.surahNumber === chapterId ? lastRead.scrollOffset : 0;
    if (!initialVerse && savedOffset > 0 && verses.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: savedOffset,
          animated: false,
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses.length]);

  const renderHeader = () => (
    <QuranDetailHeaderSection
      chapterId={chapterId}
      selectedTransId={selectedTransId}
      reciterName={reciterName}
      onTranslationChange={setTranslationId}
    />
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={S.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={S.loadingText}>Loading Surah...</Text>
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
        keyExtractor={(item: SurahVerse) => String(item.id)}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={verticalScale(60)}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: scale(20),
          paddingTop: verticalScale(67),
          paddingBottom: verticalScale(180),
        }}
      />
    );
  };

  return (
    <View style={S.root}>
      <LinearGradient
        colors={
          isDark
            ? [colors.background, colors.background]
            : [colors.primary + "08", colors.background]
        }
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
  colors: any,
  fontFamily: any,
  fontSize: any,
  isDark: boolean,
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
      gap: verticalScale(12),
      paddingHorizontal: scale(32),
    },
    loadingText: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
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
