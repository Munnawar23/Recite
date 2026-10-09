import React from "react";
import { useTranslation } from "react-i18next";
import { RefreshControlProps, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "@/components";
import { type ThemeSpacing } from "@/theme";

type TabValue = "favorites" | "downloads";

interface LibraryEmptyStateProps {
  activeTab: TabValue;
  refreshControl: React.ReactElement<RefreshControlProps>;
  spacing: ThemeSpacing;
}

export const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({
  activeTab,
  refreshControl,
  spacing,
}) => {
  const { t } = useTranslation();
  const styles = createStyles(spacing);

  const isFavorites = activeTab === "favorites";
  const icon: keyof typeof Ionicons.glyphMap = isFavorites
    ? "heart-outline"
    : "download-outline";
  const title = isFavorites
    ? t("library.emptyFavorites.title", "No Favorites Yet")
    : t("library.emptyDownloads.title", "No Downloads");
  const subtitle = isFavorites
    ? t(
        "library.emptyFavorites.subtitle",
        "Mark your favorite Surahs to access them quickly here.",
      )
    : t(
        "library.emptyDownloads.subtitle",
        "Download Surahs to read or listen to them offline.",
      );

  return (
    <ScrollView
      contentContainerStyle={styles.emptyStateWrapper}
      refreshControl={refreshControl}
    >
      <EmptyState
        icon={icon}
        title={title}
        subtitle={subtitle}
      />
    </ScrollView>
  );
};

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    emptyStateWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: spacing.vXxl * 2,
    },
  });
