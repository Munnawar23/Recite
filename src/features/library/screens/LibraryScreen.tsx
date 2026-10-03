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

import { Header, NoConnection, TabSwitcher } from "@/components";
import QuranCard from "@/features/quran/components/QuranCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeSpacing } from "@/theme";
import { Chapter } from "@/types";
import { LibraryEmptyState } from "../components/LibraryEmptyState";
import { TabValue, useLibraryData } from "../hooks/useLibraryData";

export default function LibraryScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabValue>("favorites");
  const [refreshing, setRefreshing] = useState(false);

  const { listData, isError, refetch } = useLibraryData(activeTab);

  const styles = useMemo(() => createStyles(spacing), [spacing]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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

  return (
    <View style={styles.flexContainer}>
      <Header
        title={t("library.title", "Library")}
        subtitle={t("library.subtitle", "Your saved surahs and downloads")}
      />

      <View style={styles.tabSwitcherContainer}>
        <TabSwitcher
          tabs={tabsData}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>

      <View style={styles.flexContainer}>
        {isError ? (
          <ScrollView
            contentContainerStyle={styles.emptyStateWrapper}
            refreshControl={refreshControl}
          >
            <NoConnection onRetry={refetch} />
          </ScrollView>
        ) : listData.length > 0 ? (
          <FlashList<Chapter>
            data={listData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentContainer}
            refreshControl={refreshControl}
          />
        ) : (
          <LibraryEmptyState
            activeTab={activeTab}
            refreshControl={refreshControl}
            spacing={spacing}
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
      marginBottom: spacing.vSm,
    },
    listContentContainer: {
      paddingBottom: spacing.vXxl,
    },
    emptyStateWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
