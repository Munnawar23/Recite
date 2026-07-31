import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
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
import SafeArea from "@/components/layout/SafeArea";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import QuranCard from "@/features/quran/components/QuranCard";
import SearchBar from "@/features/quran/components/SearchBar";
import { useQuranListSearch } from "@/features/quran/hooks/useQuranListSearch";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeSpacing } from "@/theme/spacing";

export default function QuranScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
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
  const styles = createStyles(spacing);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeArea>
      <FlashList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <QuranCard item={item} />}
        showsVerticalScrollIndicator={false}
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
            <ContinueReadingCard surahName="Al-Fatihah" verseNumber={1} />
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
    </SafeArea>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    listContent: {
      flexGrow: 1,
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
  });
