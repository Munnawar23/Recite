import Constants from "expo-constants";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import Header from "@/components/layout/Header";
import AboutSection from "../components/AboutSection";
import DisplayLanguageSection from "../components/DisplayLanguageSection";
import HelpSupportSection from "../components/HelpSupportSection";
import StorageSection from "../components/StorageSection";

import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();

  const appName = Constants.expoConfig?.name || "Recite";
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const styles = useMemo(
    () => createStyles(colors, fontFamily, fontSize, spacing),
    [colors, fontFamily, fontSize, spacing],
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
        <StorageSection />
        <HelpSupportSection />
        <AboutSection />

        {/* Bottom App Version Indicator */}
        <View style={styles.footerVersionContainer}>
          <Text style={styles.footerVersionText}>
            {`${appName} v${appVersion}`}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  colors: ThemeColors,
  fontFamily: any,
  fontSize: any,
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
      marginTop: verticalScale(24),
      marginBottom: verticalScale(12),
    },
    footerVersionText: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      color: colors.primary,
      letterSpacing: scale(0.5),
    },
    bottomSpacer: {
      height: verticalScale(10),
    },
  });
