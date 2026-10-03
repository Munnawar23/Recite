import Constants from "expo-constants";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText, Header } from "@/components";
import AboutSection from "../components/AboutSection";
import DisplayLanguageSection from "../components/DisplayLanguageSection";
import HelpSupportSection from "../components/HelpSupportSection";
import NotificationSection from "../components/NotificationSection";
import StorageSection from "../components/StorageSection";

import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeColors, type ThemeSpacing } from "@/theme";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { spacing } = useAppTheme();

  const appName = Constants.expoConfig?.name || "Recite";
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const styles = useMemo(
    () => createStyles(spacing),
    [spacing],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Header
          title={t("settings.title", "Settings")}
          subtitle={t(
            "settings.subtitle",
            "Customize your app preferences and theme",
          )}
        />

        {/* Sections */}
        <DisplayLanguageSection />
        <NotificationSection />
        <StorageSection />
        <HelpSupportSection />
        <AboutSection />

        {/* Bottom App Version Indicator */}
        <View style={styles.footerVersionContainer}>
          <AppText
            variant="bodyLg"
            family="title"
            color="primary"
            letterSpacing={0.5}
            align="center"
          >
            {`${appName} v${appVersion}`}
          </AppText>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  spacing: ThemeSpacing,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.vXxl,
    },
    footerVersionContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: rs.space(24),
      marginBottom: rs.space(12),
    },
    bottomSpacer: {
      height: rs.space(10),
    },
  });
