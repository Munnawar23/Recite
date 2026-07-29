import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { verticalScale } from "react-native-size-matters";

import SafeArea from "@/components/layout/SafeArea";
import Header from "@/components/ui/Header";

import AboutSection from "../components/AboutSection";
import DisplayLanguageSection from "../components/DisplayLanguageSection";
import HelpSupportSection from "../components/HelpSupportSection";
import NotificationSection from "../components/NotificationSection";
import StorageSection from "../components/StorageSection";

import { useAppTheme } from "@/hooks/useAppTheme";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { spacing } = useAppTheme();
  const S = createStyles(spacing);

  return (
    <SafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
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

        <View style={{ height: verticalScale(40) }} />
      </ScrollView>
    </SafeArea>
  );
}

const createStyles = (spacing: any) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: spacing.vXxl,
    },
  });
