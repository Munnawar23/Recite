import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAppFonts } from "@/hooks/useAppFonts";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";
import { scale, verticalScale } from "react-native-size-matters";

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
  const { colors, fontFamily, fontSize, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const S = createStyles(colors, fontFamily, fontSize, spacing, isDark);

  const handlePress = () => {
    Haptics.medium();
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
                <Ionicons name="book" size={scale(18)} color="#FFD98E" />
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
              size={scale(20)}
              color="rgba(255,255,255,0.85)"
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
  isDark: boolean,
) =>
  StyleSheet.create({
    cardWrapper: {
      paddingHorizontal: spacing.screenPadding,
      marginTop: spacing.cardMarginTop,
      marginBottom: spacing.vMd,
    },
    card: {
      borderRadius: scale(20),
      overflow: "hidden",
      shadowColor: isDark ? "#000" : "#2B5E40",
      shadowOffset: { width: 0, height: verticalScale(6) },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: scale(14),
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
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(18),
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(14),
      flex: 1,
    },
    iconContainer: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
    },
    textContainer: {
      flex: 1,
      gap: verticalScale(2),
    },
    tagText: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption,
      color: "rgba(255,255,255,0.9)",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    titleText: {
      fontFamily: fontFamily.heading,
      fontSize: fontSize.bodyLg,
      color: "#fff",
      letterSpacing: 0.3,
    },
    verseText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: "rgba(255,255,255,0.88)",
      letterSpacing: 0.5,
    },
    arrowIcon: {
      marginLeft: scale(10),
    },
  });
