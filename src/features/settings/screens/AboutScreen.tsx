import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";

import { AppText, Background, ScreenHeader } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeColors, type ThemeSpacing } from "@/theme";

export default function AboutScreen() {
  const { t } = useTranslation();
  const { colors, fontSize, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const S = useMemo(
    () => createStyles(colors, spacing, isDark),
    [colors, spacing, isDark],
  );

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
        {/* Hero Mission Card */}
        <Animated.View
          entering={FadeInDown.duration(350).delay(50)}
          style={S.heroCard}
        >
          <LinearGradient
            colors={
              isDark
                ? [colors.card, "#131E1B"]
                : ["#FFFFFF", colors.card]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={S.heroGradient}
          >
            <View style={S.heroTopRow}>
              <View style={S.heroIconWrapper}>
                <View style={S.heroIconHalo} />
                <View style={S.heroIconBadge}>
                  <Ionicons
                    name="book"
                    size={rs.icon(22)}
                    color={colors.primary}
                  />
                </View>
              </View>

              <View style={S.heroBadge}>
                <Ionicons
                  name="heart"
                  size={rs.icon(12)}
                  color={colors.primary}
                />
                <AppText
                  variant="caption"
                  family="title"
                  color="primary"
                >
                  {t("settings.about.freeProject", "100% Free & Open Source")}
                </AppText>
              </View>
            </View>

            <AppText
              size={fontSize.bodyLg + 1}
              lineHeight={Math.round((fontSize.bodyLg + 1) * 1.5)}
              color="text"
            >
              {t(
                "settings.about.aboutUsContent",
                "Recite is a non-profit, 100% free community project dedicated to making the Holy Quran accessible to everyone worldwide with zero ads, subscriptions, or paywalls.",
              )}
            </AppText>
          </LinearGradient>
        </Animated.View>

        {/* Feature Highlights Cards */}
        <Animated.View
          entering={FadeInDown.duration(350).delay(100)}
          style={S.card}
        >
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons
                name="volume-high-outline"
                size={rs.icon(22)}
                color={colors.primary}
              />
            </View>
            <View style={S.textWrap}>
              <AppText size={fontSize.bodyLg + 1} family="title" color="text">
                {t("settings.about.featureRecitersTitle", "Authentic Recitations")}
              </AppText>
              <AppText
                size={fontSize.body + 1}
                lineHeight={Math.round((fontSize.body + 1) * 1.4)}
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
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(350).delay(150)}
          style={S.card}
        >
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons
                name="language-outline"
                size={rs.icon(22)}
                color={colors.primary}
              />
            </View>
            <View style={S.textWrap}>
              <AppText size={fontSize.bodyLg + 1} family="title" color="text">
                {t("settings.about.featureLanguagesTitle", "Multi-Language Translations")}
              </AppText>
              <AppText
                size={fontSize.body + 1}
                lineHeight={Math.round((fontSize.body + 1) * 1.4)}
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
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(350).delay(200)}
          style={S.card}
        >
          <View style={S.cardHeaderRow}>
            <View style={S.iconBadge}>
              <Ionicons
                name="shield-checkmark-outline"
                size={rs.icon(22)}
                color={colors.primary}
              />
            </View>
            <View style={S.textWrap}>
              <AppText size={fontSize.bodyLg + 1} family="title" color="text">
                {t("settings.about.featurePrivacyTitle", "Privacy First")}
              </AppText>
              <AppText
                size={fontSize.body + 1}
                lineHeight={Math.round((fontSize.body + 1) * 1.4)}
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
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInDown.duration(350).delay(250)}
          style={S.footer}
        >
          <AppText variant="caption" color="subtext" align="center">
            {Constants.expoConfig?.name || "Recite"} • v
            {Constants.expoConfig?.version || "1.0.1"}
          </AppText>
        </Animated.View>

        <View style={S.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  colors: ThemeColors,
  spacing: ThemeSpacing,
  isDark: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.vXxl,
    },
    heroCard: {
      marginHorizontal: spacing.screenPadding,
      marginTop: rs.space(10),
      marginBottom: rs.space(14),
      borderRadius: rs.space(20),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.12)"
        : colors.primary + "35",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.08,
      shadowRadius: rs.space(12),
      elevation: 4,
    },
    heroGradient: {
      padding: rs.space(18),
      borderRadius: rs.space(20),
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: rs.space(14),
    },
    heroIconWrapper: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      width: rs.space(46),
      height: rs.space(46),
    },
    heroIconHalo: {
      position: "absolute",
      width: rs.space(46),
      height: rs.space(46),
      borderRadius: rs.space(23),
      backgroundColor: colors.primary + "18",
    },
    heroIconBadge: {
      width: rs.space(38),
      height: rs.space(38),
      borderRadius: rs.space(19),
      backgroundColor: isDark ? colors.card : colors.background,
      borderWidth: 1.5,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(5),
      paddingHorizontal: rs.space(10),
      paddingVertical: rs.space(6),
      borderRadius: rs.space(20),
      backgroundColor: colors.primary + "15",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginBottom: rs.space(10),
      borderRadius: rs.space(18),
      padding: rs.space(16),
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.18 : 0.04,
      shadowRadius: rs.space(8),
      elevation: 2,
    },
    cardHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: rs.space(14),
    },
    iconBadge: {
      width: rs.space(44),
      height: rs.space(44),
      borderRadius: rs.space(14),
      backgroundColor: colors.primary + "15",
      borderWidth: 1,
      borderColor: colors.primary + "25",
      alignItems: "center",
      justifyContent: "center",
      marginTop: rs.space(2),
    },
    textWrap: {
      flex: 1,
    },
    cardSubtitle: {
      marginTop: rs.space(4),
    },
    footer: {
      paddingTop: rs.space(18),
      paddingBottom: rs.space(6),
      alignItems: "center",
      justifyContent: "center",
    },
    bottomSpacer: {
      height: rs.space(16),
    },
  });
