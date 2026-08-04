import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { verticalScale } from "react-native-size-matters";

import Background from "@/components/layout/Background";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import TabSwitcher from "@/components/ui/TabSwitcher";
import { ThemePhonePicker } from "@/components/ui/ThemePhonePicker";

import { useAppTheme } from "@/hooks/useAppTheme";
import { FontSizeScale, useFontStore } from "@/store/fontStore";

export default function DisplayScreen() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();

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

  const S = createStyles(
    colors,
    fontFamily,
    fontSize,
    spacing,
    textMultiplier,
    quranMultiplier,
  );

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

        <View style={{ height: verticalScale(14) }} />

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

        <View style={{ height: verticalScale(8) }} />

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
          <Text style={S.previewHeader}>
            {t("settings.display.livePreview", "Live Preview")}
          </Text>
          <Text style={S.previewTranslation}>
            {t(
              "settings.display.sampleTranslation",
              "In the name of Allah, the Most Gracious, the Most Merciful",
            )}
          </Text>
          <Text style={S.previewArabic}>
            {t(
              "settings.display.sampleArabic",
              "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
            )}
          </Text>
        </View>

        <View style={{ height: verticalScale(30) }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
  textMultiplier: number = 1,
  quranMultiplier: number = 1,
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
    previewHeader: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.title,
      color: colors.primary,
    },
    previewTranslation: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body * textMultiplier,
      color: colors.text,
      lineHeight: fontSize.body * textMultiplier * 1.5,
    },
    previewArabic: {
      fontFamily: fontFamily.quran,
      fontSize: fontSize.arabic * quranMultiplier,
      color: colors.primary,
      textAlign: "right",
      marginTop: verticalScale(4),
      lineHeight: fontSize.arabic * quranMultiplier * 1.8,
    },
  });
