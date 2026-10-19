import { AppText } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useFontStore } from "@/store/fontStore";
import { FONT_SCALE_MULTIPLIER } from "@/theme";
import type { SurahVerse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface VerseRowProps {
  item: SurahVerse;
  selectedTransId: string;
  isActive?: boolean;
  isHintActive?: boolean;
  onLayout?: (y: number) => void;
  onPress?: (verseKey: string) => void;
  onLongPress?: (item: SurahVerse) => void;
}

function VerseRow({
  item,
  selectedTransId,
  isActive,
  isHintActive,
  onLayout,
  onPress,
  onLongPress,
}: VerseRowProps) {
  const { t } = useTranslation();
  const { colors, fontSize } = useAppTheme();
  const fontSizeScale = useFontStore((state) => state.fontSizeScale);
  const quranFontSizeScale = useFontStore((state) => state.quranFontSizeScale);

  const textMultiplier = FONT_SCALE_MULTIPLIER[fontSizeScale] ?? 1.0;
  const quranMultiplier = FONT_SCALE_MULTIPLIER[quranFontSizeScale] ?? 1.0;

  const S = useMemo(
    () => createStyles(colors),
    [colors],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(item.verseKey)}
      onLongPress={() => {
        Haptics.heavy();
        onLongPress?.(item);
      }}
      delayLongPress={300}
      style={S.verseRow}
      onLayout={(e) => {
        onLayout?.(e.nativeEvent.layout.y);
      }}
    >
      {/* Centered Verse Number Header */}
      <View style={S.verseHeader}>
        <AppText
          size={fontSize.title * quranMultiplier}
          family="quran"
          color={isActive || isHintActive ? "primary" : "subtext"}
        >
          ﴿ {item.verseKey} ﴾
        </AppText>
      </View>

      {/* Interactive Hint Focus Badge */}
      {isHintActive ? (
        <View style={S.hintBadge}>
          <Ionicons
            name="hand-left-outline"
            size={rs.icon(15)}
            color={colors.primary}
          />
          <AppText variant="body" family="title" color="primary">
            {t("verse.holdForActions", "Hold for actions")}
          </AppText>
        </View>
      ) : null}

      {/* Arabic text — centered, highlighted when active or hint active */}
      <View
        style={[
          S.arabicWrapper,
          (isActive || isHintActive) && S.activeArabicWrapper,
          isHintActive && S.hintArabicWrapper,
        ]}
      >
        <AppText
          size={fontSize.arabic * quranMultiplier}
          family="quran"
          align="center"
          color={isActive || isHintActive ? "primary" : colors.quranVerse}
          style={[
            S.arabicText,
            {
              lineHeight: Math.round(fontSize.arabic * quranMultiplier * 2.2),
              letterSpacing: 2.5,
            },
          ]}
        >
          {item.arabic}
        </AppText>
      </View>

      {/* Translation below arabic */}
      {selectedTransId !== "0" && item.translation ? (
        <AppText
          size={fontSize.title * textMultiplier}
          family="text"
          color="text"
          align="center"
          style={[
            S.translationText,
            {
              lineHeight: Math.round(fontSize.title * textMultiplier * 1.7),
            },
          ]}
        >
          {item.translation}
        </AppText>
      ) : null}

      {/* Elegant Separator */}
      <View style={S.separatorContainer}>
        <View style={S.separatorLine} />
        <AppText size={13} color="primary">◈</AppText>
        <View style={S.separatorLine} />
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(VerseRow);

const createStyles = (colors: any) =>
  StyleSheet.create({
    verseRow: {
      paddingTop: rs.space(8),
      paddingBottom: rs.space(8),
      paddingHorizontal: 0,
      marginVertical: 0,
      width: "100%",
    },
    arabicWrapper: {
      paddingVertical: rs.space(8),
      paddingHorizontal: 0,
      borderRadius: rs.space(12),
      width: "100%",
    },
    activeArabicWrapper: {
      backgroundColor: colors.primary + "18",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    hintBadge: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(4),
      backgroundColor: colors.primary + "18",
      borderWidth: 1,
      borderColor: colors.primary + "40",
      paddingHorizontal: rs.space(10),
      paddingVertical: rs.space(3),
      borderRadius: rs.space(16),
      marginBottom: rs.space(8),
    },
    hintArabicWrapper: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.primary + "16",
      borderRadius: rs.space(16),
      paddingHorizontal: rs.space(8),
      paddingVertical: rs.space(8),
    },
    separatorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rs.space(10),
      marginTop: rs.space(18),
      marginBottom: rs.space(8),
      paddingHorizontal: rs.space(20),
    },
    separatorLine: {
      flex: 1,
      height: 1.5,
      backgroundColor: colors.primary + "40",
    },
    arabicText: {
      fontWeight: "600",
      width: "100%",
    },
    verseHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: rs.space(6),
    },
    translationText: {
      marginTop: rs.space(10),
      marginBottom: rs.space(4),
      paddingHorizontal: 0,
      width: "100%",
    },
  });
