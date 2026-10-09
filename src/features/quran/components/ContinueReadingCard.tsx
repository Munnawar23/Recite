import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AppText } from "@/components";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { type ThemeColors, type ThemeSpacing } from "@/theme";

interface ContinueReadingCardProps {
  surahName: string;
  verseNumber: number;
  onPress?: () => void;
}

export default function ContinueReadingCard({
  surahName,
  verseNumber,
  onPress,
}: ContinueReadingCardProps) {
  const { t } = useTranslation();
  const { colors, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const S = createStyles(colors, spacing, isDark);

  const handlePress = () => {
    Haptics.light();
    onPress?.();
  };

  return (
    <View style={S.cardWrapper}>
      <TouchableOpacity
        style={S.card}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={colors.continueReadingCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.gradient}
        >
          <View style={S.container}>
            <View style={S.leftSection}>
              <View style={S.iconContainer}>
                <Ionicons name="book" size={rs.icon(20)} color="#FFD98E" />
              </View>
              <View style={S.textContainer}>
                <AppText
                  variant="caption"
                  family="title"
                  color="rgba(255,255,255,0.9)"
                  letterSpacing={0.8}
                  style={S.tagText}
                >
                  {t("quran.continueReadingTag")}
                </AppText>
                <AppText
                  variant="bodyLg"
                  family="heading"
                  color="#fff"
                  letterSpacing={0.3}
                >
                  {surahName}
                </AppText>
                <AppText
                  variant="body"
                  family="text"
                  color="rgba(255,255,255,0.88)"
                  letterSpacing={0.5}
                >
                  {t("quran.verseNumber", { number: verseNumber })}
                </AppText>
              </View>
            </View>
            <Ionicons
              name="arrow-forward-outline"
              size={rs.icon(22)}
              color="rgba(255,255,255,0.85)"
              style={S.arrowIcon}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (
  colors: ThemeColors,
  spacing: ThemeSpacing,
  isDark: boolean,
) =>
  StyleSheet.create({
    cardWrapper: {
      paddingHorizontal: spacing.screenPadding,
      marginTop: spacing.cardMarginTop,
      marginBottom: spacing.vMd,
    },
    card: {
      borderRadius: rs.space(20),
      overflow: "hidden",
      shadowColor: isDark ? "#000" : "#2B5E40",
      shadowOffset: { width: 0, height: rs.space(6) },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: rs.space(14),
      elevation: 8,
    },
    gradient: {
      position: "relative",
      overflow: "hidden",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: verticalScale(18),
      paddingHorizontal: scale(18),
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(14),
      flex: 1,
    },
    iconContainer: {
      width: scale(42),
      height: scale(42),
      borderRadius: scale(21),
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    textContainer: {
      flex: 1,
      gap: verticalScale(3),
    },
    tagText: {
      textTransform: "uppercase",
    },
    arrowIcon: {
      marginLeft: rs.space(10),
    },
  });
