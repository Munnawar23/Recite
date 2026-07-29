import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import type { SurahVerse } from "@/types/quran";
import { useFontStore } from "@/store/fontStore";

interface VerseRowProps {
  item: SurahVerse;
  selectedTransId: string;
  isActive?: boolean;
  onLayout?: (y: number) => void;
  onPress?: () => void;
}

export default function VerseRow({ item, selectedTransId, isActive, onLayout, onPress }: VerseRowProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const { fontSizeScale, quranFontSizeScale } = useFontStore();

  let textMultiplier = 1.0;
  if (fontSizeScale === "small") textMultiplier = 0.85;
  else if (fontSizeScale === "large") textMultiplier = 1.25;

  let quranMultiplier = 1.0;
  if (quranFontSizeScale === "small") quranMultiplier = 0.85;
  else if (quranFontSizeScale === "large") quranMultiplier = 1.25;

  const S = createStyles(colors, fontFamily, fontSize, textMultiplier, quranMultiplier);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={S.verseRow}
      onLayout={(e) => {
        onLayout?.(e.nativeEvent.layout.y);
      }}
    >
      {/* Centered Verse Number Header */}
      <View style={S.verseHeader}>
        <Text style={[S.verseOrnament, isActive && { color: colors.primary }]}>
          ﴿ {item.verseKey} ﴾
        </Text>
      </View>

      {/* Arabic text — centered, highlighted when active */}
      <View style={[S.arabicWrapper, isActive && S.activeArabicWrapper]}>
        <Text style={[S.arabicText, isActive && { color: colors.primary }]}>
          {item.arabic}
        </Text>
      </View>

      {/* Translation below arabic */}
      {selectedTransId !== "0" && item.translation ? (
        <Text style={S.translationText}>
          {item.translation}
        </Text>
      ) : null}

      {/* Thin separator */}
      <View style={S.verseSeparator} />
    </TouchableOpacity>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, textMultiplier: number, quranMultiplier: number) =>
  StyleSheet.create({
    verseRow: {
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(12),
      paddingHorizontal: scale(12),
      marginVertical: verticalScale(4),
    },
    arabicWrapper: {
      paddingVertical: verticalScale(8),
      paddingHorizontal: scale(14),
      borderRadius: scale(12),
    },
    activeArabicWrapper: {
      backgroundColor: colors.primary + "18",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    verseSeparator: {
      height: 1,
      backgroundColor: colors.border + "40",
      marginTop: verticalScale(14),
    },
    arabicText: {
      color: colors.text,
      fontFamily: fontFamily.quran,
      fontSize: fontSize.arabic * quranMultiplier,
      lineHeight: fontSize.arabic * quranMultiplier * 2.1,
      textAlign: "center",
    },
    verseHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(6),
    },
    verseOrnament: {
      color: colors.subtext,
      fontFamily: fontFamily.quran,
      fontSize: fontSize.title * quranMultiplier,
    },
    translationText: {
      color: colors.text,
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg * textMultiplier,
      lineHeight: fontSize.bodyLg * textMultiplier * 1.7,
      marginTop: verticalScale(10),
      textAlign: "center",
      paddingHorizontal: scale(10),
    },
  });
