import React, { useCallback, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AppText } from "@/components";
import { getLocalizedSurah } from "@/constants";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { type ThemeColors, type ThemeSpacing } from "@/theme";
import { Chapter as QuranItem } from "@/types";

interface QuranCardProps {
  item: QuranItem;
  onPress?: (item: QuranItem) => void;
}

function QuranCard({ item, onPress }: QuranCardProps) {
  const { t } = useTranslation();
  const { colors, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const S = useMemo(
    () => createStyles(colors, spacing, isDark),
    [colors, spacing, isDark],
  );

  const language = useLanguageStore((state) => state.language);
  const localized = useMemo(
    () =>
      getLocalizedSurah(
        item.id,
        language,
        item.englishName,
        item.englishTranslation,
      ),
    [item.id, language, item.englishName, item.englishTranslation],
  );

  const router = useRouter();

  const handlePress = useCallback(() => {
    Haptics.medium();
    if (onPress) {
      onPress(item);
    } else {
      router.push({
        pathname: "/quran-detail/[id]" as const,
        params: {
          id: String(item.id),
          arabicName: item.name,
          englishName: localized.name,
          versesCount: String(item.versesCount),
          type: item.type === "meccan" ? "Meccan" : "Medinan",
        },
      });
    }
  }, [onPress, item, router, localized.name]);

  const typeTranslationKey =
    item.type.toLowerCase() === "meccan" ? "quran.meccan" : "quran.medinan";

  return (
    <View style={S.cardWrapper}>
      <TouchableOpacity
        style={S.card}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[colors.primary + "0F", colors.card]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={S.leftSection}>
          {/* 8-Pointed Islamic Star Number Badge */}
          <View style={S.numberBadge}>
            <Svg
              width={scale(36)}
              height={scale(36)}
              viewBox="0 0 36 36"
              style={StyleSheet.absoluteFill}
            >
              <Path
                d="M 18 3 L 22.02 8.30 L 28.61 7.39 L 27.70 13.98 L 33 18 L 27.70 22.02 L 28.61 28.61 L 22.02 27.70 L 18 33 L 13.98 27.70 L 7.39 28.61 L 8.30 22.02 L 3 18 L 8.30 13.98 L 7.39 7.39 L 13.98 8.30 Z"
                fill={colors.primary + "15"}
                stroke={colors.primary + "90"}
                strokeWidth="1"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </Svg>
            <AppText
              variant="caption"
              family="title"
              fontWeight="700"
              color="primary"
            >
              {item.id}
            </AppText>
          </View>

          {/* Names & Translation */}
          <View style={S.infoContainer}>
            <AppText
              variant="bodyLg"
              family="title"
              fontWeight="700"
              color="text"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {localized.name}
            </AppText>
            <View style={S.metaRow}>
              <AppText
                variant="caption"
                family="title"
                fontWeight="600"
                color="subtext"
                letterSpacing={0.3}
              >
                {t(typeTranslationKey)}
              </AppText>
              <View style={S.dot} />
              <AppText
                variant="caption"
                family="title"
                fontWeight="600"
                color="subtext"
                letterSpacing={0.3}
              >
                {t("quran.versesCount", { count: item.versesCount })}
              </AppText>
            </View>
          </View>
        </View>

        {/* Right Section: Arabic Calligraphy / Text */}
        <View style={S.rightSection}>
          <AppText
            variant="arabic"
            family="quran"
            color="primary"
            numberOfLines={1}
          >
            {item.name}
          </AppText>
          <AppText
            variant="caption"
            family="text"
            color="subtext"
            align="right"
            fontWeight="500"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={S.translationText}
          >
            {localized.meaning}
          </AppText>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(QuranCard);

const createStyles = (
  colors: ThemeColors,
  spacing: ThemeSpacing,
  isDark: boolean,
) =>
  StyleSheet.create({
    cardWrapper: {
      paddingHorizontal: spacing.screenPadding,
      marginBottom: verticalScale(8),
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(16),
      borderRadius: scale(16),
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: isDark ? "#000" : colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: scale(4),
      elevation: 2,
      overflow: "hidden",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1.2,
      gap: scale(12),
      zIndex: 1,
      marginRight: scale(6),
    },
    numberBadge: {
      width: scale(36),
      height: scale(36),
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    },
    infoContainer: {
      flex: 1,
      justifyContent: "center",
      gap: verticalScale(2),
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: scale(6),
    },
    dot: {
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: colors.subtext,
      opacity: 0.8,
    },
    rightSection: {
      flex: 0.8,
      alignItems: "flex-end",
      justifyContent: "center",
      gap: verticalScale(2),
      zIndex: 1,
    },
    translationText: {
      opacity: 0.8,
    },
  });
