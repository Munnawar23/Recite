import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { AppText, Background, ScreenHeader } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, spacing);

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
          <AppText
            size={fontSize.bodyLg + 1}
            lineHeight={Math.round((fontSize.bodyLg + 1) * 1.45)}
            color="text"
          >
            {t(
              "settings.about.aboutUsContent",
              "Recite is a non-profit, 100% free community project dedicated to making the Holy Quran accessible to everyone worldwide with zero ads, subscriptions, or paywalls.",
            )}
          </AppText>
        </View>

        {/* Feature Highlights Cards */}
        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons name="volume-high-outline" size={rs.icon(20)} color={colors.primary} />
            </View>
            <View style={S.textWrap}>
              <AppText size={fontSize.bodyLg + 1} family="title" color="text">
                {t("settings.about.featureRecitersTitle", "Authentic Recitations")}
              </AppText>
              <AppText
                size={fontSize.body + 1}
                lineHeight={Math.round((fontSize.body + 1) * 1.35)}
                color="subtext"
                style={S.cardSubtitle}
              >
                {t(
                  "settings.about.featureRecitersDesc",
                  "High-quality audio from world-renowned Qaris with verse-by-verse playback.",
                )}
              </AppText>
            </View>
          </View>
        </View>

        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons name="language-outline" size={rs.icon(20)} color={colors.primary} />
            </View>
            <View style={S.textWrap}>
              <AppText size={fontSize.bodyLg + 1} family="title" color="text">
                {t("settings.about.featureLanguagesTitle", "Multi-Language Translations")}
              </AppText>
              <AppText
                size={fontSize.body + 1}
                lineHeight={Math.round((fontSize.body + 1) * 1.35)}
                color="subtext"
                style={S.cardSubtitle}
              >
                {t(
                  "settings.about.featureLanguagesDesc",
                  "Read side-by-side verse translations across multiple global languages.",
                )}
              </AppText>
            </View>
          </View>
        </View>

        <View style={S.card}>
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons name="shield-checkmark-outline" size={rs.icon(20)} color={colors.primary} />
            </View>
            <View style={S.textWrap}>
              <AppText size={fontSize.bodyLg + 1} family="title" color="text">
                {t("settings.about.featurePrivacyTitle", "Privacy First")}
              </AppText>
              <AppText
                size={fontSize.body + 1}
                lineHeight={Math.round((fontSize.body + 1) * 1.35)}
                color="subtext"
                style={S.cardSubtitle}
              >
                {t(
                  "settings.about.featurePrivacyDesc",
                  "No tracking, ad profiling, or personal data collection required.",
                )}
              </AppText>
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
      marginTop: rs.space(8),
      marginBottom: rs.space(14),
      borderRadius: rs.space(16),
      padding: rs.space(16),
      borderWidth: 1,
      borderColor: colors.border,
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginBottom: rs.space(8),
      borderRadius: rs.space(16),
      padding: rs.space(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: rs.space(12),
    },
    iconBadge: {
      width: rs.space(36),
      height: rs.space(36),
      borderRadius: rs.space(10),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      marginTop: rs.space(2),
    },
    textWrap: {
      flex: 1,
    },
    cardSubtitle: {
      marginTop: rs.space(3),
    },
    bottomSpacer: {
      height: rs.space(20),
    },
  });
