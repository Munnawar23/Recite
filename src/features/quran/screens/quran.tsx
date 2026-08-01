import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import EmptyState from "@/components/layout/EmptyState";
import Header from "@/components/layout/Header";
import NoConnection from "@/components/layout/NoConnection";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import QuranCard from "@/features/quran/components/QuranCard";
import SearchBar from "@/features/quran/components/SearchBar";
import { useQuranListSearch } from "@/features/quran/hooks/useQuranListSearch";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import { ThemeSpacing } from "@/theme/spacing";

export default function QuranScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { lastRead } = useReadingProgressStore();
  const {
    inputValue,
    setInputValue,
    handleClear,
    filteredData,
    isLoading,
    isError,
    refetch,
  } = useQuranListSearch();
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<any>(null);
  const styles = createStyles(spacing);

  // Scroll to top whenever filtered results change
  useEffect(() => {
    if (listRef.current && filteredData.length > 0) {
      listRef.current.scrollToOffset({ offset: 0, animated: false });
    }
  }, [filteredData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed header — never scrolls away */}
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
      <FlashList
        ref={listRef}
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <QuranCard item={item} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {lastRead ? (
              <ContinueReadingCard
                surahName={lastRead.surahName}
                verseNumber={lastRead.verseNumber}
                onPress={() =>
                  router.push({
                    pathname: "/surah/[id]",
                    params: {
                      id: String(lastRead.surahNumber),
                      englishName: lastRead.surahName,
                      arabicName: lastRead.arabicName,
                      versesCount: lastRead.versesCount,
                      type: lastRead.type,
                      initialVerse: String(lastRead.verseNumber),
                    },
                  })
                }
              />
            ) : (
              <View style={styles.topSpacer} />
            )}
            {isLoading && !refreshing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            isError ? (
              <View style={styles.emptyContainer}>
                <NoConnection onRetry={() => refetch()} />
              </View>
            ) : (
              <EmptyState
                icon="search-outline"
                title={t("quran.noResultsTitle")}
                subtitle={t("quran.noResultsSubtitle")}
              />
            )
          ) : null
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
      />
    </View>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
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
    },
    bottomSpacer: {
      height: spacing.vXxl,
    },
    topSpacer: {
      height: spacing.vMd,
    },
  });
