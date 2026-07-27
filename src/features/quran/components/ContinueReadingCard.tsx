import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useAppFonts } from "@/hooks/useAppFonts";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";

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
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize, spacing);

  const handlePress = () => {
    Haptics.medium();
    onPress?.();
  };

  return (
    <View style={S.cardWrapper}>
      <TouchableOpacity style={S.card} onPress={handlePress} activeOpacity={0.85}>
        <LinearGradient
          colors={colors.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={S.gradient}
        >
          <View style={S.container}>
            <View style={S.leftSection}>
              <View style={S.iconContainer}>
                <Ionicons name="book" size={spacing.xl} color={colors.splashText} />
              </View>
              <View style={S.textContainer}>
                <Text style={S.tagText}>{t("quran.continueReadingTag")}</Text>
                <Text style={S.titleText}>{surahName}</Text>
                <Text style={S.verseText}>
                  {t("quran.verseNumber", { number: verseNumber })}
                </Text>
              </View>
            </View>
            <Ionicons
              name="arrow-forward-outline"
              size={spacing.xl}
              color={colors.splashText}
              style={S.arrowIcon}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

type AppFonts = ReturnType<typeof useAppFonts>;

const createStyles = (
  colors: ThemeColors,
  fontFamily: AppFonts["fontFamily"],
  fontSize: AppFonts["fontSize"],
  spacing: ThemeSpacing,
) =>
  StyleSheet.create({
    cardWrapper: {
      paddingHorizontal: spacing.screenPadding,
      marginTop: spacing.cardMarginTop,
      marginBottom: spacing.cardMarginBottom,
    },
    card: {
      borderRadius: spacing.lg,
      borderWidth: 1,
      borderColor: "transparent",
      overflow: "hidden",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: spacing.vXs },
      shadowOpacity: 0.3,
      shadowRadius: spacing.md,
      elevation: 6,
    },
    gradient: {
      position: "relative",
      overflow: "hidden",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.vMd,
      paddingHorizontal: spacing.lg,
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      flex: 1,
    },
    iconContainer: {
      width: spacing.xxxl,
      height: spacing.xxxl,
      borderRadius: spacing.xxxl / 2,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      flex: 1,
      gap: spacing.vXs / 4,
    },
    tagText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
      color: colors.splashSubtext,
      letterSpacing: 1,
    },
    titleText: {
      fontFamily: fontFamily.heading,
      fontSize: fontSize.title,
      color: colors.splashText,
      marginTop: spacing.vXs / 4,
    },
    verseText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: colors.splashSubtext,
    },
    arrowIcon: {
      marginLeft: spacing.sm,
    },
  });


