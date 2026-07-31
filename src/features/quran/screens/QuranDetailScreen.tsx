import { useActiveQuranDetail } from "@/features/quran/hooks/useQuranDetail";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Haptics } from "@/lib/haptics";
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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";

// Sub-components
import CommonModal from "@/components/ui/CommonModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AudioPlayerControls from "../components/AudioPlayerControls";
import BismillahBanner from "../components/BismillahBanner";
import DetailHeader from "../components/DetailHeader";
import DownloadCard from "../components/DownloadCard";
import VerseRow from "../components/VerseRow";
import { RECITER_OPTIONS, useQuranAudio } from "../hooks/useQuranAudio";

const TRANSLATION_OPTIONS = [
  { label: "Arabic Only", value: "0" },
  { label: "English (Saheeh)", value: "20" },
  { label: "Urdu (Maududi)", value: "97" },
  { label: "Hindi (Azizul Haque)", value: "122" },
  { label: "Indonesian (Ministry)", value: "33" },
  { label: "Bengali (Taisirul)", value: "161" },
];

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList as any);

export default function QuranDetailScreen() {
  const { id, arabicName, englishName, versesCount, type } =
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

  const { translationId: globalTranslationId } = useQuranSettingsStore();
  const [selectedTransId, setSelectedTransId] = useState<string>(
    globalTranslationId || "20",
  );

  const { downloadedChapters } = useDownloadsStore();
  const localChapter = downloadedChapters[chapterId];
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

  // Audio Playback integration
  const {
    player,
    status,
    activeVerseKey,
    isLoadingAudio,
    reciterId,
    setReciterId,
    timestamps = [],
  } = useQuranAudio(chapterId, true);

  const activeReciter = RECITER_OPTIONS.find((r) => r.id === reciterId);
  const reciterName = activeReciter
    ? activeReciter.label
    : "Mishary Rashid Alafasy";

  const listRef = useRef<any>(null);

  // Scroll direction detection for hiding/showing audio player & header
  const lastScrollY = useSharedValue(0);
  const playerScrollTranslateY = useSharedValue(0);
  const headerScrollTranslateY = useSharedValue(0);

  const isPlayingAudio = status?.playing;

  const { setLastRead, setScrollOffset, setVerseNumber, lastRead } =
    useReadingProgressStore();

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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      const delta = currentY - lastScrollY.value;
      lastScrollY.value = currentY;

      // Persist scroll offset (debounced via JS thread)
      runOnJS(saveScrollOffset)(currentY);

      if (currentY <= 10) {
        // Near top — keep both header and player visible
        playerScrollTranslateY.value = withTiming(0, { duration: 200 });
        headerScrollTranslateY.value = withTiming(0, { duration: 200 });
      } else if (delta > 6) {
        // Scrolling down — hide header sliding up
        headerScrollTranslateY.value = withTiming(-120, { duration: 250 });
        // Only hide player if audio is NOT currently playing
        if (!isPlayingAudio) {
          playerScrollTranslateY.value = withTiming(200, { duration: 250 });
        } else {
          playerScrollTranslateY.value = withTiming(0, { duration: 200 });
        }
      } else if (delta < -6) {
        // Scrolling up — bring both back
        playerScrollTranslateY.value = withTiming(0, { duration: 250 });
        headerScrollTranslateY.value = withTiming(0, { duration: 250 });
      }
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerScrollTranslateY.value }],
  }));

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
      const matchedTimestamp = timestamps.find(
        (ts) => ts.verse_key === verseKey,
      );
      if (matchedTimestamp && player) {
        player.seekTo((matchedTimestamp.timestamp_from + 150) / 1000);
      }
    },
    [timestamps, player, playerScrollTranslateY],
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

  const { initialVerse } = useLocalSearchParams<{ initialVerse?: string }>();

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
  // (only when there is no initialVerse navigation param)
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
    <View>
      <View style={{ marginTop: verticalScale(4) }}>
        <CommonModal
          data={TRANSLATION_OPTIONS}
          value={selectedTransId}
          onChange={(item) => {
            Haptics.medium();
            setSelectedTransId(item.value);
          }}
          placeholder="Select Translation"
        />
      </View>
      <DownloadCard
        chapterId={chapterId}
        reciterName={reciterName}
        selectedTransId={selectedTransId}
      />
      <BismillahBanner chapterId={chapterId} />
      <View style={{ height: verticalScale(8) }} />
    </View>
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
        estimatedItemSize={220}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
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
            reciterId={reciterId}
            onReciterChange={setReciterId}
            scrollTranslateY={playerScrollTranslateY}
          />
        )}
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
