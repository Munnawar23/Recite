import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

import { useAppTheme } from "@/hooks/useAppTheme";
import { getHijriDate } from "@/utils/dateUtils";

export default function HijriCard() {
  const { t, i18n } = useTranslation();
  const { colors, fontFamily, fontSize, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const S = createStyles(colors, fontFamily, fontSize, spacing, isDark);
  const hijriDate = getHijriDate(i18n.language);

  // Gradient selection for luxury aesthetic
  const cardGradientColors: [string, string, string] = isDark
    ? ["#1C2D2B", "#142220", "#0D1716"]
    : ["#488E67", "#346F4E", "#234E35"];

  return (
    <View style={S.wrapper}>
      {/* Outer Glow Border Effect */}
      <View style={S.glowBorder} />

      <LinearGradient
        colors={cardGradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.gradient}
      >
        {/* Decorative Background Artwork & Geometric Rings */}
        <View style={S.decoCircleLarge} />
        <View style={S.decoCircleMedium} />
        <View style={S.decoDiamondPattern} />
        <View style={S.decoGlowMesh} />

        {/* Top Header Bar */}
        <View style={S.topRow}>
          {/* Islamic Date Badge with Kaaba Emoji */}
          <View style={S.badge}>
            <Text style={S.kaabaEmoji}>🕋</Text>
            <Text style={S.badgeText}>
              {t("home.hijriCard.badge", "Islamic Date")}
            </Text>
          </View>
        </View>

        {/* Delicate Separator */}
        <View style={S.dividerRow}>
          <View style={S.dividerLine} />
          <View style={S.dividerDot} />
          <View style={S.dividerLine} />
        </View>

        {/* Main Hijri Date Body */}
        <View style={S.dateRow}>
          {/* Hero Day Number (Clean & Large without border) */}
          <View style={S.dayContainer}>
            <Text style={S.dayNumber}>{hijriDate.day}</Text>
          </View>

          {/* Vertical Decorative Divider */}
          <View style={S.verticalSepContainer}>
            <View style={S.sepDotTop} />
            <View style={S.verticalSep} />
            <View style={S.sepDotBottom} />
          </View>

          {/* Date Information Details */}
          <View style={S.dateInfo}>
            {/* Hijri Month */}
            <Text style={S.month} numberOfLines={1}>
              {hijriDate.month}
            </Text>

            {/* Hijri Year Tag & Weekday Container */}
            <View style={S.detailsRow}>
              <View style={S.yearBadge}>
                <Ionicons
                  name="sparkles-sharp"
                  size={scale(9)}
                  color="#FFD98E"
                />
                <Text style={S.yearText}>
                  {hijriDate.year} {t("home.hijriCard.yearSuffix", "AH")}
                </Text>
              </View>

              <View style={S.weekdayRow}>
                <View style={S.weekdayDot} />
                <Text style={S.weekday}>{hijriDate.weekday}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Geometric Motif Accent */}
        <View style={S.bottomMotifRow}>
          <View style={S.motifLine} />
          <Text style={S.motifSymbol}>✦</Text>
          <View style={S.motifLine} />
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
  isDark: boolean,
) =>
  StyleSheet.create({
    wrapper: {
      marginHorizontal: spacing.screenPadding,
      marginTop: spacing.cardMarginTop,
      borderRadius: scale(24),
      position: "relative",
      shadowColor: isDark ? "#000000" : "#1B472E",
      shadowOffset: {
        width: 0,
        height: verticalScale(8),
      },
      shadowOpacity: isDark ? 0.6 : 0.22,
      shadowRadius: scale(16),
      elevation: 10,
    },

    glowBorder: {
      ...StyleSheet.absoluteFill,
      borderRadius: scale(24),
      borderWidth: 1.2,
      borderColor: isDark
        ? "rgba(212, 168, 106, 0.25)"
        : "rgba(255, 255, 255, 0.35)",
      zIndex: 2,
      pointerEvents: "none",
    },

    gradient: {
      borderRadius: scale(24),
      paddingHorizontal: scale(20),
      paddingTop: verticalScale(15),
      paddingBottom: verticalScale(13),
      overflow: "hidden",
      position: "relative",
    },

    /* ── Decorative Geometric Backgrounds ── */
    decoCircleLarge: {
      position: "absolute",
      top: -scale(40),
      right: -scale(40),
      width: scale(160),
      height: scale(160),
      borderRadius: scale(80),
      borderWidth: 1.5,
      borderColor: "rgba(255, 217, 142, 0.08)",
    },

    decoCircleMedium: {
      position: "absolute",
      bottom: -scale(30),
      left: -scale(30),
      width: scale(130),
      height: scale(130),
      borderRadius: scale(65),
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.05)",
    },

    decoDiamondPattern: {
      position: "absolute",
      top: scale(20),
      right: scale(60),
      width: scale(60),
      height: scale(60),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: "rgba(255, 217, 142, 0.06)",
      transform: [{ rotate: "45deg" }],
    },

    decoGlowMesh: {
      position: "absolute",
      top: 0,
      left: scale(20),
      width: scale(100),
      height: scale(50),
      backgroundColor: "rgba(255, 217, 142, 0.04)",
      borderRadius: scale(50),
    },

    /* ── Top Row Header ── */
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: verticalScale(8),
    },

    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      backgroundColor: "rgba(0, 0, 0, 0.22)",
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(4.5),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: "rgba(255, 217, 142, 0.3)",
    },

    kaabaEmoji: {
      fontSize: moderateScale(13),
      lineHeight: moderateScale(15),
    },

    badgeText: {
      fontSize: moderateScale(10),
      fontFamily: fontFamily.title || fontFamily["body-bold"],
      color: "#FFD98E",
      letterSpacing: 1,
      textTransform: "uppercase",
    },

    /* ── Divider ── */
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(10),
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "rgba(255, 255, 255, 0.12)",
    },

    dividerDot: {
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: "rgba(255, 217, 142, 0.5)",
      marginHorizontal: scale(8),
    },

    /* ── Date Row Main Body ── */
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    /* Hero Day Number (Borderless) */
    dayContainer: {
      minWidth: scale(60),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(4),
    },

    dayNumber: {
      fontSize: moderateScale(44),
      fontFamily: fontFamily.heading,
      color: "#FFFFFF",
      includeFontPadding: false,
      backgroundColor: "transparent",
      textAlign: "center",
      lineHeight: moderateScale(48),
    },

    /* Vertical Separator */
    verticalSepContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: scale(13),
      height: verticalScale(52),
    },

    verticalSep: {
      width: 1,
      flex: 1,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },

    sepDotTop: {
      width: scale(3),
      height: scale(3),
      borderRadius: scale(1.5),
      backgroundColor: "rgba(255, 217, 142, 0.6)",
      marginBottom: verticalScale(2.5),
    },

    sepDotBottom: {
      width: scale(3),
      height: scale(3),
      borderRadius: scale(1.5),
      backgroundColor: "rgba(255, 217, 142, 0.6)",
      marginTop: verticalScale(2.5),
    },

    /* Date Info */
    dateInfo: {
      flex: 1,
      justifyContent: "center",
      gap: verticalScale(3),
    },

    month: {
      fontSize: moderateScale(19),
      fontFamily: fontFamily.heading,
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },

    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: scale(10),
    },

    yearBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: "rgba(255, 217, 142, 0.15)",
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2.5),
      borderRadius: scale(8),
      borderWidth: 0.8,
      borderColor: "rgba(255, 217, 142, 0.35)",
    },

    yearText: {
      fontSize: moderateScale(11),
      fontFamily: fontFamily.title || fontFamily["body-bold"],
      color: "#FFD98E",
      letterSpacing: 0.4,
    },

    weekdayRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
    },

    weekdayDot: {
      width: scale(5),
      height: scale(5),
      borderRadius: scale(2.5),
      backgroundColor: "#FFD98E",
      shadowColor: "#FFD98E",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 3,
      elevation: 2,
    },

    weekday: {
      fontSize: fontSize.body,
      fontFamily: fontFamily.text,
      color: "rgba(255, 255, 255, 0.9)",
    },

    /* Bottom Decorative Accent Strip */
    bottomMotifRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: verticalScale(10),
      gap: scale(8),
      opacity: 0.6,
    },

    motifLine: {
      width: scale(24),
      height: 1,
      backgroundColor: "rgba(255, 217, 142, 0.4)",
    },

    motifSymbol: {
      fontSize: moderateScale(8),
      color: "#FFD98E",
    },
  });
