import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  AppText,
  Background,
  ScreenHeader,
  SectionTitle,
  TabSwitcher,
  ThemePhonePicker,
} from "@/components";

import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { FontSizeScale, useFontStore } from "@/store/fontStore";

export default function DisplayScreen() {
  const { t } = useTranslation();
  const { colors, fontSize, spacing } = useAppTheme();

  const {
    fontSizeScale,
    setFontSizeScale,
    quranFontSizeScale,
    setQuranFontSizeScale,
  } = useFontStore();

  const fontSizeTabs = [
    { label: t("settings.display.fontSize.small", "Small"), value: "small" },
    {
      label: t("settings.display.fontSize.default", "Default"),
      value: "default",
    },
    { label: t("settings.display.fontSize.large", "Large"), value: "large" },
  ];

  let textMultiplier = 1.0;
  if (fontSizeScale === "small") textMultiplier = 0.90;
  else if (fontSizeScale === "large") textMultiplier = 1.12;

  let quranMultiplier = 1.0;
  if (quranFontSizeScale === "small") quranMultiplier = 0.90;
  else if (quranFontSizeScale === "large") quranMultiplier = 1.12;

  const S = createStyles(colors, spacing);

  return (
    <View style={{ flex: 1 }}>
      <Background />
      <ScreenHeader
        title={t("settings.display.title", "Display Settings")}
        subtitle={t("settings.display.subtitle", "Theme, fonts & text sizes")}
        titleFontSize={fontSize.cardTitle - 1}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
      >
        {/* 1. Theme Option */}
        <SectionTitle
          label={t("settings.display.appTheme", "App Theme")}
          icon="color-palette-outline"
          tightSpacing
        />

        {/* Phone Theme Cards */}
        <ThemePhonePicker />

        <View style={{ height: rs.space(14) }} />

        {/* 2. App Font Size */}
        <SectionTitle
          label={t("settings.display.appFontSize", "App Font Size")}
          icon="text-outline"
          tightSpacing
        />
        <TabSwitcher
          tabs={fontSizeTabs}
          activeTab={fontSizeScale}
          onTabChange={(val: FontSizeScale) => {
            setFontSizeScale(val);
          }}
        />

        <View style={{ height: rs.space(8) }} />

        {/* 3. Quran Font Size */}
        <SectionTitle
          label={t("settings.display.quranFontSize", "Quran Arabic Font Size")}
          icon="book-outline"
          tightSpacing
        />
        <TabSwitcher
          tabs={fontSizeTabs}
          activeTab={quranFontSizeScale}
          onTabChange={(val: FontSizeScale) => {
            setQuranFontSizeScale(val);
          }}
        />

        {/* Clean Live Preview Box */}
        <View style={S.previewCard}>
          <AppText
            variant="title"
            family="title"
            color="primary"
          >
            {t("settings.display.livePreview", "Live Preview")}
          </AppText>
          <AppText
            size={fontSize.body * textMultiplier}
            lineHeight={Math.round(fontSize.body * textMultiplier * 1.5)}
            color="text"
          >
            {t(
              "settings.display.sampleTranslation",
              "In the name of Allah, the Most Gracious, the Most Merciful",
            )}
          </AppText>
          <AppText
            size={fontSize.arabic * quranMultiplier}
            lineHeight={Math.round(fontSize.arabic * quranMultiplier * 1.8)}
            family="quran"
            color="primary"
            align="right"
            style={S.previewArabic}
          >
            {t(
              "settings.display.sampleArabic",
              "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
            )}
          </AppText>
        </View>

        <View style={{ height: rs.space(30) }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: spacing.vXxl,
    },
    previewCard: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginTop: spacing.cardMarginBottom,
      borderRadius: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.itemGap,
    },
    previewArabic: {
      marginTop: rs.space(4),
    },
  });
