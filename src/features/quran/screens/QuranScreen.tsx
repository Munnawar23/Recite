import { FlashList, FlashListRef, ListRenderItemInfo } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, RefreshControlProps, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

import {
  EmptyState,
  Header,
  NoConnection,
  TabOption,
  TabSwitcher,
} from "@/components";
import { getLocalizedSurah, LOADING_ANIM } from "@/constants";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import QuranCard from "@/features/quran/components/QuranCard";
import QuranListenCard from "@/features/quran/components/QuranListenCard";
import SearchBar from "@/features/quran/components/SearchBar";
import { useChapterSearch } from "@/features/quran/hooks/useChapterSearch";
import { useQuranChapters } from "@/features/quran/hooks/useQuranChapters";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
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
      "",
      lastRead.arabicName,
    ).name,
    arabicName: lastRead.arabicName,
    versesCount: lastRead.versesCount,
    type: lastRead.type,
    initialVerse: String(lastRead.verseNumber),
  },
});

type QuranTab = "read" | "listen";

export default function QuranScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  const [activeTab, setActiveTab] = useState<QuranTab>("read");

  const lastRead = useReadingProgressStore((state) => state.lastRead);

  // 1. Data-fetching hook
  const { chapters, isLoading, isError, refetch } = useQuranChapters();

  // 2. Search & debouncing hook
  const { inputValue, setInputValue, handleClear, filteredData } =
    useChapterSearch(chapters);

  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashListRef<Chapter>>(null);
  const listenListRef = useRef<FlashListRef<Chapter>>(null);

  const tabsData = useMemo<TabOption[]>(
    () => [
      { label: t("common.read", "Read"), value: "read" },
      { label: t("common.listen", "Listen"), value: "listen" },
    ],
    [t],
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as QuranTab);
  }, []);

  const styles = useMemo(
    () => createStyles(spacing),
    [spacing],
  );

  // Scroll to top whenever filtered results change
  useEffect(() => {
    if (filteredData.length > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
      listenListRef.current?.scrollToOffset({ offset: 0, animated: false });
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
    ? getLocalizedSurah(
        lastRead.surahNumber,
        language,
        lastRead.surahName,
        "",
        lastRead.arabicName,
      ).name
    : "";

  const handleContinueReading = useCallback(() => {
    if (!lastRead) return;
    router.push(formatContinueReadingParams(lastRead, language));
  }, [lastRead, router, language]);

  const keyExtractorRead = useCallback(
    (item: Chapter) => `read-${item.id}`,
    [],
  );

  const keyExtractorListen = useCallback(
    (item: Chapter) => `listen-${item.id}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Chapter>) => <QuranCard item={item} />,
    [],
  );

  const renderListenItem = useCallback(
    ({ item }: ListRenderItemInfo<Chapter>) => <QuranListenCard item={item} />,
    [],
  );

  const renderListenHeader = useCallback(
    () => <View style={styles.listenTopSpacer} />,
    [styles],
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
      <View style={styles.tabSwitcherContainer}>
        <TabSwitcher
          tabs={tabsData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>
      <SearchBar
        value={inputValue}
        onChangeText={setInputValue}
        onClear={handleClear}
        placeholder={t("quran.searchPlaceholder", "Search Surah...")}
        containerStyle={styles.searchBarContainer}
      />
      <View style={styles.listWrapper}>
        {activeTab === "read" ? (
          <FlashList<Chapter>
            ref={listRef}
            data={filteredData}
            keyExtractor={keyExtractorRead}
            renderItem={renderItem}
            drawDistance={rs.space(500)}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderListEmpty}
          />
        ) : (
          <FlashList<Chapter>
            ref={listenListRef}
            data={filteredData}
            keyExtractor={keyExtractorListen}
            renderItem={renderListenItem}
            drawDistance={rs.space(500)}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.listContent}
            refreshControl={refreshControl}
            ListHeaderComponent={renderListenHeader}
            ListEmptyComponent={renderListEmpty}
          />
        )}
      </View>
    </View>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listWrapper: {
      flex: 1,
    },
    tabSwitcherContainer: {
      marginBottom: rs.space(4),
    },
    searchBarContainer: {
      marginTop: 0,
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
    topSpacer: {
      height: spacing.vMd,
    },
    listenTopSpacer: {
      height: rs.space(7),
    },
  });
