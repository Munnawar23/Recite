import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  RefreshControlProps,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { EmptyState, Header, TabSwitcher } from "@/components";
import QuranCard from "@/features/quran/components/QuranCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeSpacing } from "@/theme";
import { Chapter, FavoriteVerse } from "@/types";
import { VerseCard } from "../components/VerseCard";
import { TabValue, useLibraryData } from "../hooks/useLibraryData";

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabValue>("favorites");
  const [refreshing, setRefreshing] = useState(false);

  const { favoriteVerses, downloadedChapters } = useLibraryData();

  const styles = useMemo(
    () => createStyles(spacing),
    [spacing],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Refreshing local stores is instantaneous, simulate brief feedback
    setTimeout(() => {
      setRefreshing(false);
    }, 400);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  const tabsData = useMemo(
    () => [
      { label: t("library.tabs.favorites", "Favorites"), value: "favorites" },
      { label: t("library.tabs.downloads", "Downloads"), value: "downloads" },
    ],
    [t],
  );

  const keyExtractorVerse = useCallback(
    (item: FavoriteVerse) => item.verseKey,
    [],
  );

  const renderVerseItem = useCallback(
    ({ item }: ListRenderItemInfo<FavoriteVerse>) => (
      <VerseCard item={item} />
    ),
    [],
  );

  const keyExtractorChapter = useCallback(
    (item: Chapter) => String(item.id),
    [],
  );

  const renderChapterItem = useCallback(
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

  const isFavorites = activeTab === "favorites";
  const hasData = isFavorites
    ? favoriteVerses.length > 0
    : downloadedChapters.length > 0;

  return (
    <View style={styles.flexContainer}>
      <Header
        title={t("library.title", "Library")}
        subtitle={t("library.subtitle", "Your saved verses and downloads")}
      />

      <View style={styles.tabSwitcherContainer}>
        <TabSwitcher
          tabs={tabsData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>

      <View style={styles.flexContainer}>
        {hasData ? (
          isFavorites ? (
            <FlashList<FavoriteVerse>
              data={favoriteVerses}
              keyExtractor={keyExtractorVerse}
              renderItem={renderVerseItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContentContainer}
              refreshControl={refreshControl}
            />
          ) : (
            <FlashList<Chapter>
              data={downloadedChapters}
              keyExtractor={keyExtractorChapter}
              renderItem={renderChapterItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContentContainer}
              refreshControl={refreshControl}
            />
          )
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyStateWrapper}
            refreshControl={refreshControl}
            showsVerticalScrollIndicator={false}
          >
            <EmptyState
              icon={isFavorites ? "heart-outline" : "download-outline"}
              title={
                isFavorites
                  ? t("library.emptyFavorites.title", "No Favorites Yet")
                  : t("library.emptyDownloads.title", "No Downloads")
              }
              subtitle={
                isFavorites
                  ? t(
                      "library.emptyFavorites.subtitle",
                      "Save verses to see them here.",
                    )
                  : t(
                      "library.emptyDownloads.subtitle",
                      "Download Surahs to listen offline.",
                    )
              }
            />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    flexContainer: {
      flex: 1,
    },
    tabSwitcherContainer: {
      marginTop: spacing.vXs,
      marginBottom: spacing.vSm,
    },
    listContentContainer: {
      paddingBottom: spacing.vLg,
    },
    emptyStateWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: spacing.vXxl,
    },
  });
