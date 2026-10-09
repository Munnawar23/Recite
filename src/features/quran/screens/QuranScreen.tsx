import { FlashList, FlashListRef, ListRenderItemInfo } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, RefreshControlProps, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

import { EmptyState, Header, NoConnection } from "@/components";
import { getLocalizedSurah, LOADING_ANIM } from "@/constants";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import QuranCard from "@/features/quran/components/QuranCard";
import SearchBar from "@/features/quran/components/SearchBar";
import { useChapterSearch } from "@/features/quran/hooks/useChapterSearch";
import { useQuranChapters } from "@/features/quran/hooks/useQuranChapters";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBottomTabBarSpacing } from "@/hooks/useBottomTabBarSpacing";
import { useLanguageStore } from "@/store/languageStore";
import { LastRead, useReadingProgressStore } from "@/store/readingProgressStore";
import { type ThemeSpacing } from "@/theme";
import { Chapter } from "@/types";

const formatContinueReadingParams = (lastRead: LastRead, language: string) => ({
  pathname: "/quran-detail/[id]" as const,
  params: {
    id: String(lastRead.surahNumber),
    englishName: getLocalizedSurah(
      lastRead.surahNumber,
      language,
      lastRead.surahName,
    ).name,
    arabicName: lastRead.arabicName,
    versesCount: lastRead.versesCount,
    type: lastRead.type,
    initialVerse: String(lastRead.verseNumber),
  },
});

export default function QuranScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  const lastRead = useReadingProgressStore((state) => state.lastRead);

  // 1. Data-fetching hook
  const { chapters, isLoading, isError, refetch } = useQuranChapters();

  // 2. Search & debouncing hook
  const { inputValue, setInputValue, handleClear, filteredData } =
    useChapterSearch(chapters);

  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashListRef<Chapter>>(null);

  const bottomSpacing = useBottomTabBarSpacing();
  const styles = useMemo(
    () => createStyles(spacing, bottomSpacing),
    [spacing, bottomSpacing],
  );

  // Scroll to top whenever filtered results change
  useEffect(() => {
    if (listRef.current && filteredData.length > 0) {
      listRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [filteredData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const language = useLanguageStore((state) => state.language);
  const localizedLastReadName = lastRead
    ? getLocalizedSurah(lastRead.surahNumber, language, lastRead.surahName).name
    : "";

  const handleContinueReading = useCallback(() => {
    if (!lastRead) return;
    router.push(formatContinueReadingParams(lastRead, language));
  }, [lastRead, router, language]);

  const keyExtractor = useCallback((item: Chapter) => String(item.id), []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Chapter>) => <QuranCard item={item} />,
    [],
  );

  const refreshControl = useMemo(
    (): React.ReactElement<RefreshControlProps> => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
      />
    ),
    [refreshing, onRefresh, colors.primary],
  );

  const renderListHeader = useCallback(
    () => (
      <>
        {lastRead ? (
          <ContinueReadingCard
            surahName={localizedLastReadName}
            verseNumber={lastRead.verseNumber}
            onPress={handleContinueReading}
          />
        ) : (
          <View style={styles.topSpacer} />
        )}
      </>
    ),
    [lastRead, localizedLastReadName, handleContinueReading, styles],
  );

  const renderListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LottieView
            source={LOADING_ANIM}
            autoPlay
            loop
            style={styles.lottieLoader}
          />
        </View>
      );
    }
    if (isError) {
      return (
        <View style={styles.emptyContainer}>
          <NoConnection onRetry={refetch} />
        </View>
      );
    }
    return (
      <EmptyState
        icon="search-outline"
        title={t("quran.noResultsTitle")}
        subtitle={t("quran.noResultsSubtitle")}
      />
    );
  }, [isLoading, isError, refetch, styles, t]);

  return (
    <View style={styles.container}>
      <Header
        title={t("quran.title", "The Noble Quran")}
        subtitle={t(
          "quran.subtitle",
          "Read, listen and reflect upon the words of Allah",
        )}
      />
      <SearchBar
        value={inputValue}
        onChangeText={setInputValue}
        onClear={handleClear}
        placeholder={t("quran.searchPlaceholder", "Search Surah...")}
      />
      <FlashList<Chapter>
        ref={listRef}
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        refreshControl={refreshControl}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ListFooterComponent={<View style={styles.bottomSpacer} />}
      />
    </View>
  );
}

const createStyles = (spacing: ThemeSpacing, bottomSpacing: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      flexGrow: 1,
      paddingTop: 0,
      paddingBottom: spacing.vLg,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.vXxl,
    },
    loadingContainer: {
      paddingVertical: spacing.vXl,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    lottieLoader: {
      width: rs.space(200),
      height: rs.space(200),
    },
    bottomSpacer: {
      height: bottomSpacing,
    },
    topSpacer: {
      height: spacing.vMd,
    },
  });
