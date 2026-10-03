import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getHijriDate } from "@/utils";

export default function HijriCard() {
  const { t, i18n } = useTranslation();
  const { colors, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const S = createStyles(colors, spacing, isDark);
  const hijriDate = getHijriDate(i18n.language);

  // Gradient colors from theme
  const cardGradientColors = colors.hijriCardGradient;

  return (
    <View style={S.wrapper}>
      <LinearGradient
        colors={cardGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.gradient}
      >
        {/* Subtle decorative elements for depth */}
        <View style={S.decoCircleLarge} />
        <View style={S.decoCircleSmall} />

        {/* Top Header */}
        <View style={S.topRow}>
          <View style={S.badge}>
            <Ionicons
              name="moon"
              size={rs.icon(12)}
              color={colors.hijriCardAccent}
            />
            <AppText
              variant="caption"
              family="title"
              color="rgba(255,255,255,0.95)"
              letterSpacing={1.2}
              numberOfLines={1}
            >
              {t("home.hijriCard.badge", "ISLAMIC DATE")}
            </AppText>
          </View>
          <AppText
            variant="bodySm"
            color="rgba(255, 255, 255, 0.85)"
            letterSpacing={0.2}
            align="right"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={S.gregorianText}
          >
            {hijriDate.gregorian}
          </AppText>
        </View>

        {/* Main Content */}
        <View style={S.mainContent}>
          <AppText
            size={52}
            family="heading"
            color="#FFFFFF"
            lineHeight={rs.font(56)}
            style={S.dayNumber}
          >
            {hijriDate.day}
          </AppText>

          <View style={S.dividerLine} />

          <View style={S.dateDetails}>
            <AppText
              size={22}
              family="heading"
              color="#FFFFFF"
              letterSpacing={0.5}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {hijriDate.month}
            </AppText>
            <View style={S.detailsRow}>
              <AppText
                variant="bodySm"
                family="title"
                color={colors.hijriCardAccent}
                numberOfLines={1}
              >
                {hijriDate.year} {t("home.hijriCard.yearSuffix", "AH")}
              </AppText>
              <View style={S.dividerDot} />
              <AppText
                variant="bodySm"
                color="rgba(255, 255, 255, 0.85)"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={S.weekday}
              >
                {hijriDate.weekday}
              </AppText>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
  isDark: boolean,
) =>
  StyleSheet.create({
    wrapper: {
      marginHorizontal: spacing.screenPadding,
      marginTop: spacing.cardMarginTop,
      borderRadius: scale(24),
      shadowColor: isDark ? "#000000" : colors.hijriCardGradient[1],
      shadowOffset: {
        width: 0,
        height: verticalScale(8),
      },
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: scale(16),
      elevation: 8,
      backgroundColor: colors.hijriCardGradient[1],
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
    },
    gradient: {
      borderRadius: scale(24),
      paddingHorizontal: scale(18),
      paddingVertical: verticalScale(22),
      overflow: "hidden",
      position: "relative",
    },
    decoCircleLarge: {
      position: "absolute",
      top: -verticalScale(30),
      right: -scale(30),
      width: scale(150),
      height: scale(150),
      borderRadius: scale(75),
      backgroundColor: "rgba(255, 255, 255, 0.04)",
    },
    decoCircleSmall: {
      position: "absolute",
      bottom: -verticalScale(20),
      left: -scale(40),
      width: scale(100),
      height: scale(100),
      borderRadius: scale(50),
      backgroundColor: "rgba(255, 255, 255, 0.03)",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale(8),
      marginBottom: verticalScale(18),
    },
    gregorianText: {
      flexShrink: 1,
    },
    badge: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      backgroundColor: "rgba(0, 0, 0, 0.15)",
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    mainContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    dayNumber: {
      includeFontPadding: false,
    },
    dividerLine: {
      width: 1,
      height: verticalScale(42),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      marginHorizontal: scale(14),
    },
    dateDetails: {
      flex: 1,
      justifyContent: "center",
      gap: verticalScale(4),
    },
    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: scale(6),
    },
    dividerDot: {
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
    weekday: {
      flexShrink: 1,
    },
  });
