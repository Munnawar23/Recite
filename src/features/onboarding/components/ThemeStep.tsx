import TabSwitcher from "@/components/ui/TabSwitcher";
import { ThemePhonePicker } from "@/components/ui/ThemePhonePicker";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { FontSizeScale, useFontStore } from "@/store/fontStore";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface ThemeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ThemeStep({ onNext, onBack }: ThemeStepProps) {
  const { t } = useTranslation();
  const {
    fontSizeScale,
    setFontSizeScale,
    quranFontSizeScale,
    setQuranFontSizeScale,
  } = useFontStore();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();

  const fontSizeTabs = [
    { label: t("settings.display.fontSize.small", "Small"), value: "small" },
    { label: t("settings.display.fontSize.default", "Default"), value: "default" },
    { label: t("settings.display.fontSize.large", "Large"), value: "large" },
  ];

  let textMultiplier = 1.0;
  if (fontSizeScale === "small") textMultiplier = 0.85;
  else if (fontSizeScale === "large") textMultiplier = 1.25;

  let quranMultiplier = 1.0;
  if (quranFontSizeScale === "small") quranMultiplier = 0.85;
  else if (quranFontSizeScale === "large") quranMultiplier = 1.25;

  const S = createStyles(
    colors,
    fontFamily,
    fontSize,
    spacing,
    textMultiplier,
    quranMultiplier,
  );

  return (
    <OnboardingStepWrapper
      step={3}
      title={t("onboarding.theme.title", "Appearance & Display")}
      subtitle={t(
        "onboarding.theme.subtitle",
        "Customize theme mode and font sizes for comfortably reading Quran.",
      )}
      icon="color-palette-outline"
      onPrimary={onNext}
      onBack={onBack}
      showSkip={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContainer}
      >
        {/* ── Theme Selection Phone Cards ── */}
        <Text style={S.sectionLabel}>
          {t("settings.display.appTheme", "App Theme")}
        </Text>

        <ThemePhonePicker showHorizontalPadding={false} />

        {/* ── App Font Size Switcher ── */}
        <Text style={[S.sectionLabel, { marginTop: verticalScale(16) }]}>
          {t("settings.display.appFontSize", "App Font Size")}
        </Text>
        <TabSwitcher
          tabs={fontSizeTabs}
          activeTab={fontSizeScale}
          containerStyle={{ paddingHorizontal: 0 }}
          onTabChange={(val: FontSizeScale) => {
            Haptics.medium();
            setFontSizeScale(val);
          }}
        />

        {/* ── Quran Font Size Switcher ── */}
        <Text style={[S.sectionLabel, { marginTop: verticalScale(14) }]}>
          {t("settings.display.quranFontSize", "Quran Arabic Font Size")}
        </Text>
        <TabSwitcher
          tabs={fontSizeTabs}
          activeTab={quranFontSizeScale}
          containerStyle={{ paddingHorizontal: 0 }}
          onTabChange={(val: FontSizeScale) => {
            Haptics.medium();
            setQuranFontSizeScale(val);
          }}
        />

        {/* ── Clean Live Preview Box ── */}
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
      </ScrollView>
    </OnboardingStepWrapper>
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
    scrollContainer: {
      paddingBottom: spacing.cardMarginBottom,
    },
    sectionLabel: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      color: colors.text,
      marginBottom: spacing.sectionHeaderBottom,
    },
    previewCard: {
      backgroundColor: colors.card,
      marginTop: spacing.cardMarginBottom,
      borderRadius: scale(16),
      padding: scale(14),
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

export default ThemeStep;
