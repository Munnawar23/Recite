import React, { useCallback, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AppText } from "@/components";
import { getLocalizedSurah } from "@/constants";
import { scale, verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { type ThemeColors, type ThemeSpacing } from "@/theme";
import { Chapter as QuranItem } from "@/types";

interface QuranListenCardProps {
  item: QuranItem;
  onPress?: (item: QuranItem) => void;
}

function QuranListenCard({ item, onPress }: QuranListenCardProps) {
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
        item.name,
      ),
    [item.id, language, item.englishName, item.englishTranslation, item.name],
  );

  const router = useRouter();

  const handlePress = useCallback(() => {
    Haptics.light();
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
          {/* 1. Surah Number Badge */}
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

          {/* 2. Translated Surah Name */}
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
          </View>
        </View>

        {/* 3 & 4. Original Arabic Verse / Name & Music Expo Icon */}
        <View style={S.rightSection}>
          <AppText
            variant="arabic"
            family="quran"
            color="primary"
            numberOfLines={1}
          >
            {item.name}
          </AppText>
          <View style={S.musicIconContainer}>
            <Ionicons
              name="musical-notes"
              size={scale(15)}
              color={colors.primary}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(QuranListenCard);

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
      minHeight: scale(58),
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
      flex: 1,
      gap: scale(12),
      zIndex: 1,
      marginRight: scale(8),
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
    },
    rightSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: scale(10),
      zIndex: 1,
    },
    musicIconContainer: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
  });
