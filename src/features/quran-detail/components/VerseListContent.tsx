import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { AppText } from "@/components";
import { getLocalizedSurah } from "@/constants";
import { rs, verticalScale } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import type { SurahVerse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import LottieView from "lottie-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import {
  RefreshControl,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import VerseActionModal from "./VerseActionModal";
import VerseListHeader from "./VerseListHeader";
import VerseRow from "./VerseRow";
import VerseShareCard from "./VerseShareCard";

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
  viewabilityConfig: React.RefObject<{
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
  const { t } = useTranslation();
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

  const language = useLanguageStore((state) => state.language);
  const localizedSurahName = useMemo(() => {
    return getLocalizedSurah(chapterId || 1, language, englishName, "", arabicName).name;
  }, [chapterId, language, englishName, arabicName]);

  const shareCardRef = useRef<View>(null);
  const [verseToShare, setVerseToShare] = useState<SurahVerse | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [selectedVerseForAction, setSelectedVerseForAction] =
    useState<SurahVerse | null>(null);

  const handleVerseLongPress = useCallback(
    (verse: SurahVerse) => {
      handleVersePress(verse.verseKey);
      setSelectedVerseForAction(verse);
    },
    [handleVersePress],
  );

  const handleCloseActionModal = useCallback(() => {
    if (isSharing) return;
    setSelectedVerseForAction(null);
  }, [isSharing]);

  const getVerseFormattedText = useCallback(
    (verse: SurahVerse) => {
      return verse.translation
        ? `${verse.arabic}\n\n"${verse.translation}"\n\n— ${localizedSurahName || englishName || "Surah"} (${verse.verseKey})`
        : `${verse.arabic}\n\n— ${localizedSurahName || englishName || "Surah"} (${verse.verseKey})`;
    },
    [localizedSurahName, englishName],
  );

  const handleShare = useCallback(
    async (verse: SurahVerse) => {
      setIsSharing(true);
      setVerseToShare(verse);

      // Brief delay to allow VerseShareCard to mount and render with the verse content
      setTimeout(async () => {
        try {
          if (shareCardRef.current) {
            const uri = await captureRef(shareCardRef, {
              format: "png",
              quality: 1,
              result: "tmpfile",
            });

            // Dismiss modal smoothly right before opening native share sheet
            setSelectedVerseForAction(null);

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(uri, {
                mimeType: "image/png",
                dialogTitle: `Quran ${englishName || localizedSurahName || "Surah"} ${verse.verseKey}`,
              });
            } else {
              // Fallback if native file sharing is unavailable
              const textToShare = getVerseFormattedText(verse);
              await Share.share({ message: textToShare });
            }
          }
        } catch (error) {
          console.error("Error generating verse share image:", error);
          setSelectedVerseForAction(null);
          // Fallback to text share on any unexpected capture error
          try {
            const textToShare = getVerseFormattedText(verse);
            await Share.share({ message: textToShare });
          } catch {}
        } finally {
          setIsSharing(false);
          setVerseToShare(null);
        }
      }, 180);
    },
    [getVerseFormattedText, localizedSurahName, englishName],
  );

  const handleCopy = useCallback(
    async (verse: SurahVerse) => {
      const textToCopy = getVerseFormattedText(verse);
      await Clipboard.setStringAsync(textToCopy);
      Haptics.success();
      setSelectedVerseForAction(null);
    },
    [getVerseFormattedText],
  );

  const toggleFavoriteVerse = useFavoritesStore(
    (state) => state.toggleFavoriteVerse,
  );

  const handleFavorite = useCallback(
    (verse: SurahVerse) => {
      const isAdded = toggleFavoriteVerse({
        id: verse.id,
        verseKey: verse.verseKey,
        verseNumber: verse.verseNumber,
        chapterId: chapterId,
        arabic: verse.arabic,
        surahName: englishName,
        surahArabicName: arabicName,
        versesCount: versesCount ? Number(versesCount) : undefined,
        chapterType: chapterType,
      });

      Haptics.success();
      Toast.show({
        type: "success",
        position: "bottom",
        text1: isAdded
          ? t("verse.favoritedTitle", "Added to Favorites")
          : t("verse.unfavoritedTitle", "Removed from Favorites"),
        text2: isAdded
          ? t("verse.favoritedMsg", "Saved to favorites")
          : t("verse.unfavoritedMsg", "Removed from favorites"),
      });
      setSelectedVerseForAction(null);
    },
    [
      toggleFavoriteVerse,
      chapterId,
      localizedSurahName,
      englishName,
      arabicName,
      versesCount,
      chapterType,
      t,
    ],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SurahVerse>) => (
      <VerseRow
        item={item}
        selectedTransId={selectedTransId}
        isActive={
          item.verseKey === activeVerseKey ||
          item.verseKey === selectedVerseForAction?.verseKey
        }
        onPress={handleVersePress}
        onLongPress={handleVerseLongPress}
      />
    ),
    [
      selectedTransId,
      activeVerseKey,
      selectedVerseForAction,
      handleVersePress,
      handleVerseLongPress,
    ],
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
          {t("quran.versesError.title", "Failed to Load")}
        </AppText>
        <AppText variant="body" color="subtext" align="center">
          {t(
            "quran.versesError.subtitle",
            "Check your internet connection and try again.",
          )}
        </AppText>
        <TouchableOpacity style={S.retryButton} onPress={refetch}>
          <AppText variant="body" family="title" color="card">
            {t("quran.versesError.retry", "Retry")}
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
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
      <VerseActionModal
        visible={!!selectedVerseForAction}
        verse={selectedVerseForAction}
        chapterId={chapterId}
        englishName={englishName}
        isSharing={isSharing}
        onClose={handleCloseActionModal}
        onShare={handleShare}
        onCopy={handleCopy}
        onFavorite={handleFavorite}
      />
      {/* Off-screen card container for high-resolution image generation */}
      <View style={S.offscreenContainer} pointerEvents="none">
        <VerseShareCard
          ref={shareCardRef}
          verse={verseToShare}
          englishName={englishName}
          localizedSurahName={localizedSurahName}
          arabicName={arabicName}
        />
      </View>
    </>
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
    offscreenContainer: {
      position: "absolute",
      left: -9999,
      top: 0,
    },
  });
