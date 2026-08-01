import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useAppFonts } from "@/hooks/useAppFonts";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";
import { Chapter as QuranItem } from "@/types/quran";
import { scale } from "react-native-size-matters";

interface QuranCardProps {
  item: QuranItem;
  onPress?: (item: QuranItem) => void;
}

export default function QuranCard({ item, onPress }: QuranCardProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const S = createStyles(colors, fontFamily, fontSize, spacing, isDark);

  const router = useRouter();

  const handlePress = () => {
    Haptics.medium();
    if (onPress) {
      onPress(item);
    } else {
      router.push({
        pathname: "/surah/[id]",
        params: {
          id: String(item.id),
          arabicName: item.name,
          englishName: item.englishName,
          versesCount: String(item.versesCount),
          type: item.type === "meccan" ? "Meccan" : "Medinan",
        },
      });
    }
  };

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
            <Text style={S.numberText}>{item.id}</Text>
          </View>

          {/* Names & Translation */}
          <View style={S.infoContainer}>
            <Text style={S.englishName} numberOfLines={1} ellipsizeMode="tail">
              {item.englishName}
            </Text>
            <View style={S.metaRow}>
              <Text style={S.metaText}>{t(typeTranslationKey)}</Text>
              <View style={S.dot} />
              <Text style={S.metaText}>
                {t("quran.versesCount", { count: item.versesCount })}
              </Text>
            </View>
          </View>
        </View>

        {/* Right Section: Arabic Calligraphy / Text */}
        <View style={S.rightSection}>
          <Text style={S.arabicText} numberOfLines={1}>
            {item.name}
          </Text>
          <Text
            style={S.translationText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.englishTranslation}
          </Text>
        </View>
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
      marginBottom: spacing.itemGap,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.vXs,
      paddingHorizontal: spacing.md,
      borderRadius: spacing.md,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: isDark ? "#000" : colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: spacing.xs,
      elevation: 2,
      overflow: "hidden",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1.2,
      gap: spacing.sm,
      zIndex: 1,
      marginRight: spacing.xs,
    },
    numberBadge: {
      width: scale(36),
      height: scale(36),
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    },
    numberText: {
      color: colors.primary,
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption * 1.1,
      fontWeight: "700",
    },
    infoContainer: {
      flex: 1,
      justifyContent: "center",
      gap: spacing.vXs / 4,
    },
    englishName: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontWeight: "600",
      fontSize: fontSize.bodyLg,
      opacity: 0.85,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    metaText: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
      letterSpacing: 0.3,
    },
    dot: {
      width: spacing.xs,
      height: spacing.xs,
      borderRadius: spacing.xs / 2,
      backgroundColor: colors.subtext + "66",
    },
    rightSection: {
      flex: 0.8,
      alignItems: "flex-end",
      justifyContent: "center",
      gap: spacing.vXs / 4,
      zIndex: 1,
    },
    arabicText: {
      color: colors.primary,
      fontFamily: fontFamily.quran,
      fontSize: fontSize.arabic,
      writingDirection: "rtl",
    },
    translationText: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
      textAlign: "right",
    },
  });
