import React, { forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components";
import { lightColors } from "@/theme";
import type { SurahVerse } from "@/types";

interface VerseShareCardProps {
  verse: SurahVerse | null;
  englishName?: string;
  localizedSurahName?: string;
  arabicName?: string;
}

/**
 * High-Resolution (720px HD canvas) Islamic poster card template:
 * - Rendered at true high-DPI dimensions so the native font engine draws
 *   sharp vector typography and diacritics directly.
 * - Top banner with soft sage-forest gradient ("#4E9B6F" -> "#2B5E40")
 * - Surah name & verse badge in crisp white (#FFFFFF) with gold accents
 * - Soft warm parchment frame (#F5F1EA)
 * - Inner card in crisp clean white (#FFFFFF) with parchment border and star ornament
 * - Arabic verse in elegant sage-forest green (#355E46) and translation in dark slate (#475569)
 * - Footer: "Recite - Quran App" in rich gold
 */
export const VerseShareCard = forwardRef<View, VerseShareCardProps>(
  function VerseShareCard(
    { verse, englishName, localizedSurahName, arabicName },
    ref,
  ) {
    if (!verse) return null;

    const surahDisplayName = localizedSurahName || "Surah";

    const surahCitation = localizedSurahName || "Surah";

    return (
      <View ref={ref} collapsable={false} style={styles.outerPoster}>
        {/* 1. Top Sage Gradient Header Banner */}
        <LinearGradient
          colors={lightColors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerBanner}
        >
          {/* Surah Name in Arabic Calligraphy (if available) */}
          {arabicName ? (
            <AppText
              family="quran"
              size={48}
              color="#FFFFFF"
              align="center"
              style={styles.arabicSurahTitle}
            >
              {arabicName}
            </AppText>
          ) : null}

          {/* Surah Name in English / Localized */}
          <AppText
            family="title"
            size={30}
            color="#FFFFFF"
            align="center"
            style={styles.surahTitle}
          >
            {surahDisplayName}
          </AppText>

          {/* Verse Number Badge */}
          <View style={styles.verseBadge}>
            <AppText
              family="title"
              size={20}
              color="#FFFFFF"
              align="center"
              style={styles.verseBadgeText}
            >
              {`﴿ Verse ${verse.verseKey} ﴾`}
            </AppText>
          </View>

          {/* Decorative Gold Accent Bar */}
          <View style={styles.bannerGoldAccent} />
        </LinearGradient>

        {/* 2. Main Content Body (Warm Paper Parchment) */}
        <View style={styles.bodySection}>
          {/* Inner Verse Card (Crisp Clean White) */}
          <View style={styles.innerCard}>
            {/* Top Star Ornament */}
            <View style={styles.starRow}>
              <View style={styles.starLine} />
              <AppText color={lightColors.accent} style={styles.starSymbol}>
                ✦
              </AppText>
              <View style={styles.starLine} />
            </View>

            {/* Quranic Arabic Verse Text (Sage-Forest Green Calligraphy) */}
            <AppText
              family="quran"
              size={42}
              lineHeight={88}
              align="center"
              color={lightColors.quranVerse}
              style={styles.arabicVerseText}
            >
              {verse.arabic}
            </AppText>

            {/* Translation Text (Dark Slate Gray) */}
            {verse.translation ? (
              <AppText
                family="text"
                size={23}
                lineHeight={38}
                align="center"
                color={lightColors.subtext}
                style={styles.translationText}
              >
                {verse.translation}
              </AppText>
            ) : null}

            {/* Verse Citation: "— Quran [Surah] [Verse] —" */}
            <View style={styles.citationRow}>
              <View style={styles.citationDash} />
              <AppText
                family="title"
                size={21}
                color={lightColors.primary}
                style={styles.citationText}
              >
                {`Quran ${surahCitation} ${verse.verseKey}`}
              </AppText>
              <View style={styles.citationDash} />
            </View>
          </View>

          {/* 3. Bottom Footer: "Recite - Quran App" */}
          <View style={styles.footerContainer}>
            <AppText
              family="title"
              size={21}
              color={lightColors.accent}
              align="center"
              style={styles.footerLink}
            >
              Recite - Quran App
            </AppText>
          </View>
        </View>
      </View>
    );
  },
);

export default VerseShareCard;

const styles = StyleSheet.create({
  outerPoster: {
    width: 720, // True 720p HD canvas width for ultra-sharp typography
    backgroundColor: lightColors.background, // #F5F1EA
    borderRadius: 32,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  /* Header Banner: Surah & Verse Info */
  headerBanner: {
    paddingTop: 48,
    paddingBottom: 36,
    paddingHorizontal: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  arabicSurahTitle: {
    fontWeight: "700",
    lineHeight: 64,
  },
  surahTitle: {
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  verseBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.38)",
    marginTop: 6,
  },
  verseBadgeText: {
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  bannerGoldAccent: {
    width: 60,
    height: 3,
    backgroundColor: "#FFD98E",
    borderRadius: 2,
    marginTop: 10,
  },
  /* Body Section */
  bodySection: {
    backgroundColor: lightColors.background, // #F5F1EA
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 38,
  },
  innerCard: {
    backgroundColor: lightColors.card, // #FFFFFF
    borderRadius: 36,
    borderWidth: 2,
    borderColor: lightColors.border, // #E2DCD2
    paddingVertical: 44,
    paddingHorizontal: 36,
    gap: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  /* Star Ornament */
  starRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
    gap: 16,
  },
  starLine: {
    flex: 1,
    height: 1.8,
    backgroundColor: lightColors.border,
  },
  starSymbol: {
    fontSize: 22,
    lineHeight: 28,
  },
  /* Arabic & Translation */
  arabicVerseText: {
    fontWeight: "600",
    paddingHorizontal: 12,
  },
  translationText: {
    paddingHorizontal: 16,
  },
  /* Citation Row */
  citationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 6,
  },
  citationDash: {
    width: 30,
    height: 2,
    backgroundColor: lightColors.primary,
    opacity: 0.5,
  },
  citationText: {
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  /* Footer */
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  footerLink: {
    fontWeight: "700",
    letterSpacing: 2,
  },
});
