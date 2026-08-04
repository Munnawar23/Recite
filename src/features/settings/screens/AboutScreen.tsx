import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import Background from "@/components/layout/Background";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SectionTitle from "@/components/ui/SectionTitle";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <View style={S.container}>
      <Background />
      <ScreenHeader
        title={t("settings.about.aboutUsTitle", "About Us")}
        subtitle={t(
          "settings.about.aboutUsSubtitle",
          "Open source & community-driven Quran app",
        )}
        titleFontSize={fontSize.cardTitle - 1}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
      >
        {/* Main Descriptive Paragraphs */}
        <View style={S.descriptionCard}>
          <Text style={S.introText}>
            {t(
              "settings.about.aboutUsContent",
              "Recite is a non-profit, 100% free community project dedicated to making the Holy Quran accessible to everyone worldwide with zero ads, subscriptions, or paywalls.",
            )}
          </Text>
          <Text style={S.introTextSecondParagraph}>
            {t(
              "settings.about.aboutAppIntro",
              "Built using high-performance open-source technologies, Recite provides authentic verse recitations, side-by-side multi-language translations, and instant search in a modern interface.",
            )}
          </Text>
        </View>

        {/* Section Title */}
        <SectionTitle
          label={t("settings.about.keyHighlights", "Technology & Platform")}
          icon="hardware-chip-outline"
          tightSpacing
        />

        {/* Essential Highlights Cards */}
        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons name="code-slash-outline" size={scale(20)} color={colors.primary} />
            </View>
            <View style={S.textWrap}>
              <Text style={S.cardTitle}>
                {t("settings.about.appFeatureOpenSourceTitle", "Open Source")}
              </Text>
              <Text style={S.cardSubtitle}>
                {t(
                  "settings.about.appFeatureOpenSourceDesc",
                  "Transparent community-driven development with open contributions welcomed.",
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons name="cloud-download-outline" size={scale(20)} color={colors.primary} />
            </View>
            <View style={S.textWrap}>
              <Text style={S.cardTitle}>
                {t("settings.about.appFeatureApiTitle", "Quran.com API")}
              </Text>
              <Text style={S.cardSubtitle}>
                {t(
                  "settings.about.appFeatureApiDesc",
                  "Powered by official API endpoints from Quran.com for verified authentic verse text & audio.",
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons name="hardware-chip-outline" size={scale(20)} color={colors.primary} />
            </View>
            <View style={S.textWrap}>
              <Text style={S.cardTitle}>
                {t("settings.about.appFeatureExpoTitle", "Built with Expo & React Native")}
              </Text>
              <Text style={S.cardSubtitle}>
                {t(
                  "settings.about.appFeatureExpoDesc",
                  "Engineered using Expo and React Native for optimal cross-platform performance.",
                )}
              </Text>
            </View>
          </View>
        </View>

        <View style={S.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.vXxl,
    },
    descriptionCard: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginTop: verticalScale(8),
      marginBottom: verticalScale(14),
      borderRadius: scale(16),
      padding: scale(16),
      borderWidth: 1,
      borderColor: colors.border,
    },
    introText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg + 1,
      color: colors.text,
      lineHeight: (fontSize.bodyLg + 1) * 1.45,
    },
    introTextSecondParagraph: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg + 1,
      color: colors.text,
      lineHeight: (fontSize.bodyLg + 1) * 1.45,
      marginTop: verticalScale(10),
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginBottom: verticalScale(8),
      borderRadius: scale(16),
      padding: scale(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: scale(12),
    },
    iconBadge: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(10),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      marginTop: verticalScale(2),
    },
    textWrap: {
      flex: 1,
    },
    cardTitle: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg + 1,
      color: colors.text,
    },
    cardSubtitle: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body + 1,
      color: colors.subtext,
      marginTop: verticalScale(3),
      lineHeight: (fontSize.body + 1) * 1.35,
    },
    bottomSpacer: {
      height: verticalScale(20),
    },
  });
