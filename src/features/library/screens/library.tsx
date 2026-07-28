import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import SafeArea from "@/components/layout/SafeArea";
import EmptyState from "@/components/ui/EmptyState";
import Header from "@/components/ui/Header";
import NoConnection from "@/components/ui/NoConnection";
import TabSwitcher from "@/components/ui/TabSwitcher";
import { useQuranListSearch } from "@/features/quran/hooks/useQuranListSearch";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeSpacing } from "@/theme/spacing";

type TabValue = "favorites" | "downloads";

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { spacing } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabValue>("favorites");
  
  const { isError, refetch } = useQuranListSearch();
  const S = createStyles(spacing);

  const tabsData = [
    { label: t("library.tabs.favorites", "Favorites"), value: "favorites" },
    { label: t("library.tabs.downloads", "Downloads"), value: "downloads" },
  ];

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
            <View style={S.emptyStateWrapper}>
              <NoConnection onRetry={() => refetch()} />
            </View>
          ) : activeTab === "favorites" ? (
            <View style={S.emptyStateWrapper}>
              <EmptyState
                icon="heart-outline"
                title={t("library.emptyFavorites.title", "No Favorites Yet")}
                subtitle={t("library.emptyFavorites.subtitle", "Mark your favorite Surahs or verses to access them quickly here.")}
              />
            </View>
          ) : (
            <View style={S.emptyStateWrapper}>
              <EmptyState
                icon="download-outline"
                title={t("library.emptyDownloads.title", "No Downloads")}
                subtitle={t("library.emptyDownloads.subtitle", "Download Surahs to read or listen to them offline.")}
              />
            </View>
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
