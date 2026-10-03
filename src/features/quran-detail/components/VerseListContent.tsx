import { AppText } from "@/components";
import { rs, verticalScale } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { SurahVerse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import LottieView from "lottie-react-native";
import React, { useCallback, useMemo } from "react";
import {
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import VerseListHeader from "./VerseListHeader";
import VerseRow from "./VerseRow";

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
  const { colors } = useAppTheme();
  const { paddingTop } = useAppSafeAreaInsets();

  const contentContainerStyle = useMemo(
    () => ({
      paddingHorizontal: rs.space(20),
      paddingTop: paddingTop + verticalScale(70),
      paddingBottom: rs.space(180),
    }),
    [paddingTop],
  );

  const S = useMemo(
    () => createStyles(colors),
    [colors],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
        progressViewOffset={rs.space(60)}
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
          size={rs.icon(52)}
          color={colors.subtext}
        />
        <AppText variant="title" family="title" color="text">
          Failed to Load
        </AppText>
        <AppText variant="body" color="subtext" align="center">
          Check your internet connection and try again.
        </AppText>
        <TouchableOpacity style={S.retryButton} onPress={refetch}>
          <AppText variant="body" family="title" color="card">
            Retry
          </AppText>
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
) =>
  StyleSheet.create({
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: rs.space(32),
      gap: rs.space(8),
    },
    lottieLoader: {
      width: rs.space(170),
      height: rs.space(170),
      marginBottom: -rs.space(10),
    },
    retryButton: {
      marginTop: rs.space(8),
      paddingHorizontal: rs.space(28),
      paddingVertical: rs.space(10),
      backgroundColor: colors.primary,
      borderRadius: rs.space(20),
    },
  });
