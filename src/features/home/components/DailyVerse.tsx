import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AppText } from "@/components";
import {
  STATIC_VERSE,
  useDailyVerse,
} from "@/features/home/hooks/useDailyVerse";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function DailyVerse() {
  const { t } = useTranslation();
  const { colors, fontSize, spacing, activeScheme } = useAppTheme();
  const { data: verse, isLoading } = useDailyVerse();
  const isDark = activeScheme === "dark";
  const S = createStyles(colors, spacing, isDark);

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
        colors={colors.dailyVerseGradient}
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
              <AppText
                variant="title"
                color="primary"
                family="quran"
                letterSpacing={2}
                align="center"
              >
                ﴿ {verseKey} ﴾
              </AppText>
            </View>
          )}

          {/* Arabic text */}
          <AppText
            variant="arabic"
            color="primary"
            family="quran"
            align="center"
            lineHeight={Math.round(fontSize.arabic * 2.15)}
            style={S.arabic}
          >
            {currentVerse.arabic}
          </AppText>

          {/* Ornamental divider */}
          <View style={S.divider}>
            <View style={S.line} />
            <View style={S.ornament}>
              <View style={S.ornamentDot} />
              <Ionicons name="star" size={rs.icon(8)} color={colors.accent} />
              <View style={S.ornamentDot} />
            </View>
            <View style={S.line} />
          </View>

          {/* Translation */}
          {!!currentVerse.translation && (
            <AppText
              variant="bodyLg"
              color="text"
              align="center"
              lineHeight={Math.round(fontSize.bodyLg * 1.65)}
              style={S.translation}
            >
              {currentVerse.translation}
            </AppText>
          )}

          {/* Source badge */}
          <View style={S.footer}>
            <View style={S.sourceBadge}>
              <Ionicons name="book" size={rs.icon(10)} color={colors.accent} />
              <AppText
                variant="caption"
                color="accent"
                semiBold
                letterSpacing={0.4}
              >
                {currentVerse.source}
              </AppText>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
  isDark: boolean,
) =>
  StyleSheet.create({
    card: {
      marginHorizontal: spacing.screenPadding,
      borderRadius: rs.space(22),
      paddingTop: spacing.vXxl,
      paddingBottom: spacing.vXxl,
      paddingHorizontal: spacing.xxl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      backgroundColor: colors.card,
      shadowColor: isDark ? "#000" : colors.accent,
      shadowOffset: { width: 0, height: spacing.vXs },
      shadowOpacity: isDark ? 0.25 : 0.1,
      shadowRadius: rs.space(14),
      elevation: 4,
    },

    /* ── Verse key ── */
    verseKeyRow: {
      alignItems: "center",
      marginBottom: spacing.vSm,
    },

    /* ── Arabic ── */
    arabic: {
      textAlign: "center",
      writingDirection: "rtl",
      marginBottom: spacing.xs,
    },

    /* ── Ornamental divider ── */
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: spacing.vMd,
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
      width: rs.space(3),
      height: rs.space(3),
      borderRadius: rs.space(2),
      backgroundColor: colors.accent + "55",
    },

    /* ── Translation ── */
    translation: {
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
      gap: rs.space(5),
      backgroundColor: colors.accent + "15",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.vXs,
      borderRadius: rs.space(30),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.accent + "40",
    },

    /* ── Loading ── */
    loadingContainer: {
      paddingVertical: spacing.vXxxl,
      justifyContent: "center",
      alignItems: "center",
    },
  });
