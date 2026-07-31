import { FlashList } from "@shopify/flash-list";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import EmptyState from "@/components/layout/EmptyState";
import Header from "@/components/layout/Header";
import NoConnection from "@/components/layout/NoConnection";
import SafeArea from "@/components/layout/SafeArea";
import TabSwitcher from "@/components/ui/TabSwitcher";
import { DOWNLOAD_ANIM, EMPTY_ANIM } from "@/constants/assets";
import QuranCard from "@/features/quran/components/QuranCard";
import { useQuranListSearch } from "@/features/quran/hooks/useQuranListSearch";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { ThemeSpacing } from "@/theme/spacing";

type TabValue = "favorites" | "downloads";

const FlashListCast = FlashList as any;

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabValue>("favorites");
  const [refreshing, setRefreshing] = useState(false);

  const { chapters, isError, refetch } = useQuranListSearch();
  const { favoriteIds } = useFavoritesStore();
  const { downloadedChapters } = useDownloadsStore();

  const S = createStyles(spacing);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const tabsData = [
    { label: t("library.tabs.favorites", "Favorites"), value: "favorites" },
    { label: t("library.tabs.downloads", "Downloads"), value: "downloads" },
  ];

  const favoriteChapters = chapters.filter((ch) => favoriteIds.includes(ch.id));
  const downloadedChapterIds = Object.keys(downloadedChapters).map((id) =>
    Number(id),
  );
  const downloadedChapterList = chapters.filter((ch) =>
    downloadedChapterIds.includes(ch.id),
  );

  const listData =
    activeTab === "favorites" ? favoriteChapters : downloadedChapterList;

  return (
    <SafeArea>
      <View style={S.container}>
        <Header
          title={t("library.title", "Library")}
          subtitle={t("library.subtitle", "Your saved surahs and downloads")}
        />

        <View style={S.tabSwitcherContainer}>
          <TabSwitcher
            tabs={tabsData}
            activeTab={activeTab}
            onTabChange={(value) => setActiveTab(value as TabValue)}
          />
        </View>

        <View style={S.contentContainer}>
          {isError ? (
            <ScrollView
              contentContainerStyle={S.emptyStateWrapper}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            >
              <NoConnection onRetry={() => refetch()} />
            </ScrollView>
          ) : listData.length > 0 ? (
            <FlashListCast
              data={listData}
              keyExtractor={(item: any) => String(item.id)}
              renderItem={({ item }: { item: any }) => (
                <QuranCard item={item} />
              )}
              estimatedItemSize={80}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: spacing.vXxl }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            />
          ) : activeTab === "favorites" ? (
            <ScrollView
              contentContainerStyle={S.emptyStateWrapper}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            >
              <EmptyState
                animationSource={DOWNLOAD_ANIM}
                title={t("library.emptyFavorites.title", "No Favorites Yet")}
                subtitle={t(
                  "library.emptyFavorites.subtitle",
                  "Mark your favorite Surahs to access them quickly here.",
                )}
              />
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={S.emptyStateWrapper}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            >
              <EmptyState
                animationSource={EMPTY_ANIM}
                title={t("library.emptyDownloads.title", "No Downloads")}
                subtitle={t(
                  "library.emptyDownloads.subtitle",
                  "Download Surahs to read or listen to them offline.",
                )}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </SafeArea>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    tabSwitcherContainer: {
      marginTop: spacing.sectionHeaderTop,
      marginBottom: spacing.sectionHeaderBottom,
    },
    contentContainer: {
      flex: 1,
    },
    emptyStateWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: spacing.vXxl * 2,
    },
  });
