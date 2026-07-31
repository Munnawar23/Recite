import TabSwitcher from "@/components/ui/TabSwitcher";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { FontSizeScale, useFontStore } from "@/store/fontStore";
import { ThemeMode, useThemeStore } from "@/store/themeStore";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface ThemeStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ThemeStep({ onNext, onBack }: ThemeStepProps) {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useThemeStore();
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

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: "light", label: t("settings.display.theme.light", "Light") },
    { key: "dark", label: t("settings.display.theme.dark", "Dark") },
    { key: "system", label: t("settings.display.theme.system", "System") },
  ];

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

        <View style={S.phoneCardsRow}>
          {themeOptions.map((opt) => {
            const isSelected = themeMode === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  S.phoneCardContainer,
                  isSelected && S.phoneCardSelected,
                ]}
                onPress={() => {
                  Haptics.medium();
                  setThemeMode(opt.key);
                }}
                activeOpacity={0.8}
              >
                {/* Top Radio Indicator */}
                <View style={S.radioOuter}>
                  {isSelected && <View style={S.radioInner} />}
                </View>

                {/* Phone Frame Mockup */}
                <View style={[S.phoneFrame, getPhoneFrameBg(opt.key, colors)]}>
                  {opt.key === "light" && <LightPhoneMockup />}
                  {opt.key === "dark" && <DarkPhoneMockup />}
                  {opt.key === "system" && <SystemPhoneMockup />}
                </View>

                {/* Card Title Label */}
                <Text style={[S.phoneCardLabel, isSelected && S.phoneCardLabelSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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

function getPhoneFrameBg(mode: ThemeMode, colors: any) {
  if (mode === "light") return { backgroundColor: "#1A2228" };
  if (mode === "dark") return { backgroundColor: "#10161A" };
  return { backgroundColor: "#141C20" };
}

/* ── Light Phone Mockup Graphic ── */
function LightPhoneMockup() {
  return (
    <View style={mockStyles.lightBody}>
      <View style={mockStyles.lightHeader} />
      <View style={mockStyles.lightBanner} />
      <View style={mockStyles.lightCard} />
      <View style={mockStyles.gridRow}>
        <View style={mockStyles.lightBox} />
        <View style={mockStyles.lightBox} />
        <View style={mockStyles.lightBox} />
      </View>
      <View style={mockStyles.lightNav} />
    </View>
  );
}

/* ── Dark Phone Mockup Graphic ── */
function DarkPhoneMockup() {
  return (
    <View style={mockStyles.darkBody}>
      <View style={mockStyles.darkHeader} />
      <View style={mockStyles.darkBanner} />
      <View style={mockStyles.darkCard} />
      <View style={mockStyles.gridRow}>
        <View style={mockStyles.darkBox} />
        <View style={mockStyles.darkBox} />
        <View style={mockStyles.darkBox} />
      </View>
      <View style={mockStyles.darkNav} />
    </View>
  );
}

/* ── System Split Half/Half Phone Mockup Graphic ── */
function SystemPhoneMockup() {
  return (
    <View style={mockStyles.systemContainer}>
      <View style={mockStyles.splitLeft}>
        <View style={mockStyles.lightHeader} />
        <View style={mockStyles.lightBanner} />
        <View style={mockStyles.lightCard} />
        <View style={mockStyles.gridRow}>
          <View style={mockStyles.lightBox} />
        </View>
        <View style={mockStyles.lightNav} />
      </View>
      <View style={mockStyles.splitRight}>
        <View style={mockStyles.darkHeader} />
        <View style={mockStyles.darkBanner} />
        <View style={mockStyles.darkCard} />
        <View style={mockStyles.gridRow}>
          <View style={mockStyles.darkBox} />
        </View>
        <View style={mockStyles.darkNav} />
      </View>
    </View>
  );
}

const mockStyles = StyleSheet.create({
  // Light mock (Emerald green & warm beige)
  lightBody: {
    flex: 1,
    backgroundColor: "#F2E9DD",
    borderRadius: scale(10),
    padding: scale(6),
    gap: verticalScale(4),
  },
  lightHeader: {
    height: verticalScale(6),
    width: "40%",
    backgroundColor: "#3F7A5C",
    borderRadius: scale(3),
  },
  lightBanner: {
    height: verticalScale(20),
    backgroundColor: "#3F7A5C",
    borderRadius: scale(6),
    opacity: 0.85,
  },
  lightCard: {
    height: verticalScale(12),
    backgroundColor: "#FAF4EC",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#E3D5C1",
  },
  lightBox: {
    flex: 1,
    height: verticalScale(18),
    backgroundColor: "#FAF4EC",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#E3D5C1",
  },
  lightNav: {
    height: verticalScale(10),
    backgroundColor: "#E3D5C1",
    borderRadius: scale(3),
    marginTop: "auto",
  },

  // Dark mock (Slate dark & warm gold)
  darkBody: {
    flex: 1,
    backgroundColor: "#121415",
    borderRadius: scale(10),
    padding: scale(6),
    gap: verticalScale(4),
  },
  darkHeader: {
    height: verticalScale(6),
    width: "40%",
    backgroundColor: "#D4A86A",
    borderRadius: scale(3),
  },
  darkBanner: {
    height: verticalScale(20),
    backgroundColor: "#192223",
    borderRadius: scale(6),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkCard: {
    height: verticalScale(12),
    backgroundColor: "#192223",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkBox: {
    flex: 1,
    height: verticalScale(18),
    backgroundColor: "#192223",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkNav: {
    height: verticalScale(10),
    backgroundColor: "#1E2B2C",
    borderRadius: scale(3),
    marginTop: "auto",
  },

  // System Split
  systemContainer: {
    flex: 1,
    flexDirection: "row",
    borderRadius: scale(10),
    overflow: "hidden",
  },
  splitLeft: {
    flex: 1,
    backgroundColor: "#FAF6EF",
    padding: scale(6),
    gap: verticalScale(4),
  },
  splitRight: {
    flex: 1,
    backgroundColor: "#161D22",
    padding: scale(6),
    gap: verticalScale(4),
  },
  gridRow: {
    flexDirection: "row",
    gap: scale(3),
  },
});

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
    phoneCardsRow: {
      flexDirection: "row",
      gap: spacing.itemGap,
    },
    phoneCardContainer: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: scale(16),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(8),
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    phoneCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    },
    radioOuter: {
      width: scale(18),
      height: scale(18),
      borderRadius: scale(9),
      borderWidth: 1.5,
      borderColor: colors.subtext,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(10),
    },
    radioInner: {
      width: scale(9),
      height: scale(9),
      borderRadius: scale(4.5),
      backgroundColor: colors.primary,
    },
    phoneFrame: {
      width: "100%",
      height: verticalScale(120),
      borderRadius: scale(14),
      padding: scale(6),
      marginBottom: verticalScale(10),
    },
    phoneCardLabel: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
      color: colors.subtext,
    },
    phoneCardLabelSelected: {
      color: colors.primary,
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
