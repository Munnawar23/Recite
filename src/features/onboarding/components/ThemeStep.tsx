import { AppText, TabSwitcher, ThemePhonePicker } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { FontSizeScale, useFontStore } from "@/store/fontStore";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
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
  const { colors, fontSize, spacing } = useAppTheme();

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
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContainer}
      >
        {/* ── Theme Selection Phone Cards ── */}
        <AppText variant="bodyLg" family="title" color="text" style={S.sectionLabel}>
          {t("settings.display.appTheme", "App Theme")}
        </AppText>

        <ThemePhonePicker showHorizontalPadding={false} />

        {/* ── App Font Size Switcher ── */}
        <AppText
          variant="bodyLg"
          family="title"
          color="text"
          style={[S.sectionLabel, { marginTop: rs.space(16) }]}
        >
          {t("settings.display.appFontSize", "App Font Size")}
        </AppText>
        <TabSwitcher
          tabs={fontSizeTabs}
          activeTab={fontSizeScale}
          containerStyle={{ paddingHorizontal: 0 }}
          onTabChange={(val: FontSizeScale) => {
            Haptics.light();
            setFontSizeScale(val);
          }}
        />

        {/* ── Quran Font Size Switcher ── */}
        <AppText
          variant="bodyLg"
          family="title"
          color="text"
          style={[S.sectionLabel, { marginTop: rs.space(14) }]}
        >
          {t("settings.display.quranFontSize", "Quran Arabic Font Size")}
        </AppText>
        <TabSwitcher
          tabs={fontSizeTabs}
          activeTab={quranFontSizeScale}
          containerStyle={{ paddingHorizontal: 0 }}
          onTabChange={(val: FontSizeScale) => {
            Haptics.light();
            setQuranFontSizeScale(val);
          }}
        />

        {/* ── Clean Live Preview Box ── */}
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
      </ScrollView>
    </OnboardingStepWrapper>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
) =>
  StyleSheet.create({
    scrollContainer: {
      paddingBottom: spacing.cardMarginBottom,
    },
    sectionLabel: {
      marginBottom: spacing.sectionHeaderBottom,
    },
    previewCard: {
      backgroundColor: colors.card,
      marginTop: spacing.cardMarginBottom,
      borderRadius: rs.space(16),
      padding: rs.space(14),
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.itemGap,
    },
    previewArabic: {
      marginTop: rs.space(4),
    },
  });

export default ThemeStep;
