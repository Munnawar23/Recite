import React, { useCallback, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppText } from "@/components";
import { getLocalizedSurah } from "@/constants";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import type { FavoriteVerse } from "@/types";
import Toast from "react-native-toast-message";

interface VerseCardProps {
  item: FavoriteVerse;
}

export function VerseCard({ item }: VerseCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, fontSize } = useAppTheme();
  const language = useLanguageStore((state) => state.language);
  const removeFavoriteVerse = useFavoritesStore(
    (state) => state.removeFavoriteVerse,
  );

  const localizedSurahName = useMemo(() => {
    return getLocalizedSurah(
      item.chapterId,
      language,
      item.surahName || `Surah ${item.chapterId}`,
      "",
      item.surahArabicName,
    ).name;
  }, [item.chapterId, language, item.surahName, item.surahArabicName]);

  const S = useMemo(() => createStyles(colors), [colors]);

  const handleCardPress = useCallback(() => {
    Haptics.light();
    router.push({
      pathname: "/quran-detail/[id]" as const,
      params: {
        id: String(item.chapterId),
        arabicName: item.surahArabicName || "",
        englishName: localizedSurahName,
        versesCount: item.versesCount ? String(item.versesCount) : "",
        type: item.chapterType || "",
        initialVerse: String(item.verseNumber),
        fromFavorite: "true",
      },
    });
  }, [router, item, localizedSurahName]);

  const handleRemoveFavorite = useCallback(() => {
    Haptics.light();
    removeFavoriteVerse(item.verseKey);
    Toast.show({
      type: "success",
      position: "bottom",
      text1: t("verse.unfavoritedTitle", "Removed from Favorites"),
      text2: t("verse.unfavoritedMsg", "Removed from favorites"),
    });
  }, [removeFavoriteVerse, item.verseKey, t]);

  return (
    <View style={S.cardWrapper}>
      <TouchableOpacity
        style={S.card}
        onPress={handleCardPress}
        activeOpacity={0.75}
      >
        <LinearGradient
          colors={[colors.primary + "0A", colors.card]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* Card Header: Surah Info, Verse Badge & Remove Button */}
        <View style={S.cardHeader}>
          <View style={S.surahInfo}>
            <AppText
              variant="title"
              family="title"
              color="text"
              numberOfLines={1}
            >
              {localizedSurahName}
            </AppText>
          </View>

          <View style={S.headerRight}>
            <View style={S.verseBadge}>
              <AppText
                variant="bodySm"
                family="title"
                color="primary"
              >
                {`﴿ ${item.verseKey} ﴾`}
              </AppText>
            </View>

            <TouchableOpacity
              style={S.heartBtn}
              onPress={handleRemoveFavorite}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Remove from favorites"
            >
              <Ionicons
                name="heart"
                size={rs.icon(18)}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Verse Arabic Preview */}
        <View style={S.arabicContainer}>
          <AppText
            size={fontSize.arabic * 0.82}
            lineHeight={Math.round(fontSize.arabic * 0.82 * 1.85)}
            family="quran"
            align="right"
            color={colors.quranVerse}
            numberOfLines={3}
            style={S.arabicText}
          >
            {item.arabic}
          </AppText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    cardWrapper: {
      marginHorizontal: rs.space(16),
      marginBottom: rs.space(12),
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: rs.space(18),
      borderWidth: 1,
      borderColor: colors.border,
      padding: rs.space(14),
      overflow: "hidden",
      gap: rs.space(10),
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    surahInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(8),
      flex: 1,
      paddingRight: rs.space(8),
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(8),
    },
    verseBadge: {
      backgroundColor: colors.primary + "16",
      paddingHorizontal: rs.space(8),
      paddingVertical: rs.space(3),
      borderRadius: rs.space(8),
      borderWidth: 1,
      borderColor: colors.primary + "28",
    },
    heartBtn: {
      width: rs.space(30),
      height: rs.space(30),
      borderRadius: rs.space(15),
      backgroundColor: colors.primary + "16",
      alignItems: "center",
      justifyContent: "center",
    },
    arabicContainer: {
      backgroundColor: colors.background,
      borderRadius: rs.space(12),
      padding: rs.space(12),
      borderWidth: 1,
      borderColor: colors.border,
    },
    arabicText: {
      width: "100%",
    },
  });
