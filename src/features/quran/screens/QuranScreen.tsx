import { FlashList, FlashListRef, ListRenderItemInfo } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, RefreshControlProps, StyleSheet, View } from "react-native";

import { EmptyState, Header } from "@/components";
import { getChapters, getSurahName } from "@/constants";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import QuranCard from "@/features/quran/components/QuranCard";
import SearchBar from "@/features/quran/components/SearchBar";
import { useChapterSearch } from "@/features/quran/hooks/useChapterSearch";
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
    localizedName: getSurahName(lastRead.surahNumber, language),
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
  const language = useLanguageStore((state) => state.language);
  const lastRead = useReadingProgressStore((state) => state.lastRead);

  // 1. Static instant local chapters data mapped directly to active language
  const chapters = useMemo(() => getChapters(language), [language]);

  // 2. Search & debouncing hook
  const { inputValue, setInputValue, handleClear, filteredData } =
    useChapterSearch(chapters);

  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashListRef<Chapter>>(null);

  const styles = useMemo(
    () => createStyles(spacing),
    [spacing],
  );

  // Scroll to top whenever filtered results change
  useEffect(() => {
    if (filteredData.length > 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [filteredData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 300);
  }, []);

  const localizedLastReadName = lastRead
    ? getSurahName(lastRead.surahNumber, language)
    : "";

  const handleContinueReading = useCallback(() => {
    if (!lastRead) return;
    router.push(formatContinueReadingParams(lastRead, language));
  }, [lastRead, router, language]);

  const keyExtractor = useCallback(
    (item: Chapter) => `chapter-${item.id}`,
    [],
  );

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
    return (
      <EmptyState
        icon="search-outline"
        title={t("quran.noResultsTitle")}
        subtitle={t("quran.noResultsSubtitle")}
      />
    );
  }, [t]);

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
        containerStyle={styles.searchBarContainer}
      />
      <View style={styles.listWrapper}>
        <FlashList<Chapter>
          ref={listRef}
          data={filteredData}
          keyExtractor={keyExtractor}
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
    searchBarContainer: {
      marginTop: 0,
    },
    listContent: {
      flexGrow: 1,
      paddingTop: 0,
      paddingBottom: spacing.vLg,
    },
    topSpacer: {
      height: spacing.vMd,
    },
  });
