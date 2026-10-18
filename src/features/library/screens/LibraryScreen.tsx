import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  RefreshControlProps,
  StyleSheet,
  View,
} from "react-native";

import { EmptyState, Header, StorageCard, TabSwitcher } from "@/components";
import QuranCard from "@/features/quran/components/QuranCard";
import { verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeSpacing } from "@/theme";
import { Chapter, FavoriteVerse } from "@/types";
import { VerseCard } from "../components/VerseCard";
import { TabValue, useLibraryData } from "../hooks/useLibraryData";

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabValue>("downloads");
  const [refreshing, setRefreshing] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { favoriteVerses, downloadedChapters } = useLibraryData();

  const styles = useMemo(
    () => createStyles(spacing),
    [spacing],
  );

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    // Refreshing local stores is instantaneous, simulate brief feedback
    refreshTimerRef.current = setTimeout(() => {
      setRefreshing(false);
      refreshTimerRef.current = null;
    }, 400);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  const tabsData = useMemo(
    () => [
      { label: t("library.tabs.downloads", "Downloads"), value: "downloads" },
      { label: t("library.tabs.favorites", "Favorites"), value: "favorites" },
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
        {isFavorites ? (
          <FlashList<FavoriteVerse>
            data={favoriteVerses}
            keyExtractor={keyExtractorVerse}
            renderItem={renderVerseItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            refreshControl={refreshControl}
            ListEmptyComponent={
              <View style={styles.emptyStateWrapper}>
                <EmptyState
                  icon="heart-outline"
                  title={t("library.emptyFavorites.title", "No Favorites Yet")}
                  subtitle={t(
                    "library.emptyFavorites.subtitle",
                    "Save verses to see them here.",
                  )}
                />
              </View>
            }
          />
        ) : (
          <FlashList<Chapter>
            data={downloadedChapters}
            keyExtractor={keyExtractorChapter}
            renderItem={renderChapterItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            refreshControl={refreshControl}
            ListHeaderComponent={<StorageCard />}
            ListEmptyComponent={
              <View style={styles.emptyStateInner}>
                <EmptyState
                  icon="download-outline"
                  title={t("library.emptyDownloads.title", "No Downloads")}
                  subtitle={t(
                    "library.emptyDownloads.subtitle",
                    "Download Surahs to listen offline.",
                  )}
                />
              </View>
            }
          />
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
      marginBottom: spacing.vXs,
    },
    listContentContainer: {
      flexGrow: 1,
      paddingBottom: verticalScale(50),
    },
    emptyStateWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: spacing.vXxl,
      minHeight: 350,
    },
    emptyStateInner: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: spacing.vXl,
      paddingBottom: spacing.vXxl,
      minHeight: 280,
    },
  });
