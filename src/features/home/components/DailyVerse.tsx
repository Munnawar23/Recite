import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

import {
  STATIC_VERSE,
  useDailyVerse,
} from "@/features/home/hooks/useDailyVerse";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function DailyVerse() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing, activeScheme } = useAppTheme();
  const { data: verse, isLoading } = useDailyVerse();
  const isDark = activeScheme === "dark";
  const S = createStyles(colors, fontFamily, fontSize, spacing, isDark);

  const fallbackVerse = {
    arabic: t("home.dailyVerse.defaultArabic", STATIC_VERSE.arabic),
    translation: t(
      "home.dailyVerse.defaultTranslation",
      STATIC_VERSE.translation,
    ),
    source: t("home.dailyVerse.defaultSource", STATIC_VERSE.source),
  };

  const currentVerse = verse || fallbackVerse;

  // Extract verse key e.g. "94:6" — works for both "Surah 94:6" and "Surah Ash-Sharh · 94:6"
  const verseKey = currentVerse.source.match(/(\d+:\d+)/)?.[1] ?? "";

  return (
    <View style={S.card}>
      {/* Subtle gold tint overlay */}
      <LinearGradient
        colors={[`${colors.accent}12`, `${colors.accent}00`]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {isLoading && !verse ? (
        <View style={S.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
        </View>
      ) : (
        <>
          {/* Verse key — centered ornament */}
          {!!verseKey && (
            <View style={S.verseKeyRow}>
              <Text style={S.verseOrnament}>﴿ {verseKey} ﴾</Text>
            </View>
          )}

          {/* Arabic text */}
          <Text style={S.arabic}>{currentVerse.arabic}</Text>

          {/* Ornamental divider */}
          <View style={S.divider}>
            <View style={S.line} />
            <View style={S.ornament}>
              <View style={S.ornamentDot} />
              <Ionicons name="star" size={scale(8)} color={colors.accent} />
              <View style={S.ornamentDot} />
            </View>
            <View style={S.line} />
          </View>

          {/* Translation */}
          <Text style={S.translation}>{currentVerse.translation}</Text>

          {/* Source badge */}
          <View style={S.footer}>
            <View style={S.sourceBadge}>
              <Ionicons name="book" size={scale(10)} color={colors.accent} />
              <Text style={S.source}>{currentVerse.source}</Text>
            </View>
          </View>
        </>
      )}
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
    card: {
      marginHorizontal: spacing.screenPadding,
      borderRadius: scale(22),
      paddingTop: spacing.vSm,
      paddingBottom: spacing.vXl,
      paddingHorizontal: spacing.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.card,
      shadowColor: isDark ? "#000" : colors.accent,
      shadowOffset: { width: 0, height: spacing.vXs },
      shadowOpacity: isDark ? 0.25 : 0.1,
      shadowRadius: scale(14),
      elevation: 4,
    },

    /* ── Verse key ── */
    verseKeyRow: {
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    verseOrnament: {
      fontSize: moderateScale(18),
      color: colors.primary,
      fontFamily: fontFamily.quran,
      letterSpacing: 2,
    },

    /* ── Arabic ── */
    arabic: {
      fontSize: fontSize.arabic,
      color: colors.primary,
      fontFamily: fontFamily["quran-bold"],
      textAlign: "center",
      lineHeight: fontSize.arabic * 1.55,
      writingDirection: "rtl",
      marginBottom: spacing.xs,
    },

    /* ── Ornamental divider ── */
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: spacing.vSm,
      paddingHorizontal: spacing.xs,
    },
    line: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    ornament: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginHorizontal: spacing.md,
    },
    ornamentDot: {
      width: scale(3),
      height: scale(3),
      borderRadius: scale(2),
      backgroundColor: colors.accent + "55",
    },

    /* ── Translation ── */
    translation: {
      fontSize: fontSize.bodyLg,
      color: colors.text,
      fontFamily: fontFamily.body,
      textAlign: "center",
      lineHeight: fontSize.bodyLg * 1.65,
      fontStyle: "italic",
      opacity: 0.88,
    },

    /* ── Source badge ── */
    footer: {
      alignItems: "center",
      marginTop: spacing.vMd,
    },
    sourceBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
      backgroundColor: colors.accent + "15",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.vXs,
      borderRadius: scale(30),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent + "40",
    },
    source: {
      fontSize: fontSize.badge,
      color: colors.accent,
      fontFamily: fontFamily["body-semibold"],
      letterSpacing: 0.4,
    },

    /* ── Loading ── */
    loadingContainer: {
      paddingVertical: spacing.vXxxl,
      justifyContent: "center",
      alignItems: "center",
    },
  });
