import { useAppTheme } from "@/hooks/useAppTheme";
import type { SurahVerse } from "@/types/quran";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import LottieView from "lottie-react-native";
import React, { useCallback, useMemo } from "react";
import {
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";
import VerseListHeader from "./VerseListHeader";
import VerseRow from "./VerseRow";

import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";

const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList as unknown as React.ComponentType<any>,
);

const keyExtractor = (item: SurahVerse) => String(item.id);

interface VerseListContentProps {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  listRef: React.RefObject<any>;
  verses: SurahVerse[];
  activeVerseKey: string | null;
  selectedTransId: string;
  handleVersePress: (verseKey: string) => void;
  scrollHandler: any;
  onViewableItemsChanged: (info: {
    viewableItems: Array<{ item: SurahVerse }>;
  }) => void;
  viewabilityConfig: React.MutableRefObject<{
    itemVisiblePercentThreshold: number;
  }>;
  refreshing: boolean;
  onRefresh: () => void;
  // Header props
  chapterId: number;
  reciterName: string;
  setTranslationId: (id: string) => void;
  audioUrl?: string | null;
  audioTotalBytes?: number | null;
  isPlayingLocally?: boolean;
  // Chapter info for offline library
  arabicName?: string;
  englishName?: string;
  englishTranslation?: string;
  versesCount?: string;
  chapterType?: string;
}

function VerseListContent({
  isLoading,
  isError,
  refetch,
  listRef,
  verses,
  activeVerseKey,
  selectedTransId,
  handleVersePress,
  scrollHandler,
  onViewableItemsChanged,
  viewabilityConfig,
  refreshing,
  onRefresh,
  chapterId,
  reciterName,
  setTranslationId,
  audioUrl,
  audioTotalBytes,
  isPlayingLocally,
  arabicName,
  englishName,
  englishTranslation,
  versesCount,
  chapterType,
}: VerseListContentProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const { paddingTop } = useAppSafeAreaInsets();

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: scale(20),
      paddingTop: paddingTop + verticalScale(75),
      paddingBottom: verticalScale(180),
    }),
    [paddingTop],
  );

  const S = useMemo(
    () => createStyles(colors, fontFamily, fontSize),
    [colors, fontFamily, fontSize],
  );

  const refreshControl = useMemo(
    () => (
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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SurahVerse>) => (
      <VerseRow
        item={item}
        selectedTransId={selectedTransId}
        isActive={item.verseKey === activeVerseKey}
        onPress={handleVersePress}
      />
    ),
    [selectedTransId, activeVerseKey, handleVersePress],
  );

  const ListHeader = useCallback(
    () => (
      <VerseListHeader
        chapterId={chapterId}
        selectedTransId={selectedTransId}
        reciterName={reciterName}
        setTranslationId={setTranslationId}
        audioUrl={audioUrl}
        audioTotalBytes={audioTotalBytes}
        isPlayingLocally={isPlayingLocally}
        arabicName={arabicName}
        englishName={englishName}
        englishTranslation={englishTranslation}
        versesCount={versesCount}
        chapterType={chapterType}
      />
    ),
    [
      chapterId,
      selectedTransId,
      reciterName,
      setTranslationId,
      audioUrl,
      audioTotalBytes,
      isPlayingLocally,
      arabicName,
      englishName,
      englishTranslation,
      versesCount,
      chapterType,
    ],
  );

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
        <TouchableOpacity style={S.retryButton} onPress={refetch}>
          <Text style={S.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedFlashList
      ref={listRef}
      data={verses}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig.current}
      refreshControl={refreshControl}
      contentContainerStyle={contentContainerStyle}
    />
  );
}

export default React.memo(VerseListContent);

const createStyles = (
  colors: ReturnType<typeof useAppTheme>["colors"],
  fontFamily: ReturnType<typeof useAppTheme>["fontFamily"],
  fontSize: ReturnType<typeof useAppTheme>["fontSize"],
) =>
  StyleSheet.create({
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(32),
    },
    lottieLoader: {
      width: scale(170),
      height: scale(170),
      marginBottom: -verticalScale(10),
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
