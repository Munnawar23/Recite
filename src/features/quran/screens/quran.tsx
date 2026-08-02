import { FlashList, FlashListRef, ListRenderItemInfo } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, RefreshControlProps, StyleSheet, View } from "react-native";

import EmptyState from "@/components/layout/EmptyState";
import Header from "@/components/layout/Header";
import NoConnection from "@/components/layout/NoConnection";
import QuranCard from "@/features/quran/components/QuranCard";
import LottieView from "lottie-react-native";
import { QuranListHeader } from "@/features/quran/components/QuranListHeader";
import SearchBar from "@/features/quran/components/SearchBar";
import { useQuranList } from "@/features/quran/hooks/useQuranList";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LastRead, useReadingProgressStore } from "@/store/readingProgressStore";
import { ThemeSpacing } from "@/theme/spacing";
import { Chapter } from "@/types/quran";
import { scale } from "react-native-size-matters";

const formatContinueReadingParams = (lastRead: LastRead) => ({
  pathname: "/quran-detail/[id]" as const,
  params: {
    id: String(lastRead.surahNumber),
    englishName: lastRead.surahName,
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

  const {
    inputValue,
    setInputValue,
    handleClear,
    filteredData,
    isLoading,
    isError,
    refetch,
  } = useQuranList();

  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashListRef<Chapter>>(null);

  const styles = useMemo(() => createStyles(spacing), [spacing]);

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

  const handleContinueReading = useCallback(() => {
    if (!lastRead) return;
    router.push(formatContinueReadingParams(lastRead));
  }, [lastRead, router]);

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
      <QuranListHeader
        lastRead={lastRead}
        onContinueReading={handleContinueReading}
        styles={styles}
      />
    ),
    [lastRead, handleContinueReading, styles],
  );

  const renderListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("@/../assets/animations/loading.json")}
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

const createStyles = (spacing: ThemeSpacing) =>
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
      width: scale(200),
      height: scale(200),
    },
    bottomSpacer: {
      height: spacing.vXxl,
    },
    topSpacer: {
      height: spacing.vMd,
    },
  });
