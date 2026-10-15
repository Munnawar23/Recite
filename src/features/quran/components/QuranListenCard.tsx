import React, { useCallback, useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AppText } from "@/components";
import { getSurahName } from "@/constants";
import { scale, verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { type ThemeColors, type ThemeSpacing } from "@/theme";
import { Chapter as QuranItem } from "@/types";
import ChapterNumberBadge from "./ChapterNumberBadge";

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
  const localizedName = useMemo(
    () => item.localizedName || getSurahName(item.id, language),
    [item.localizedName, item.id, language],
  );

  const handlePress = useCallback(() => {
    Haptics.light();
    console.log("QuranListenCard pressed:", item);
    if (onPress) {
      onPress(item);
    }
  }, [onPress, item]);

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
          {/* 1. Chapter Number Badge */}
          <ChapterNumberBadge chapterNumber={item.id} />

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
              {localizedName}
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
