import { AppText } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFontStore } from "@/store/fontStore";
import type { SurahVerse } from "@/types";
import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface VerseRowProps {
  item: SurahVerse;
  selectedTransId: string;
  isActive?: boolean;
  onLayout?: (y: number) => void;
  onPress?: (verseKey: string) => void;
}

function VerseRow({
  item,
  selectedTransId,
  isActive,
  onLayout,
  onPress,
}: VerseRowProps) {
  const { colors, fontSize } = useAppTheme();
  const fontSizeScale = useFontStore((state) => state.fontSizeScale);
  const quranFontSizeScale = useFontStore((state) => state.quranFontSizeScale);

  const textMultiplier = useMemo(() => {
    if (fontSizeScale === "small") return 0.9;
    if (fontSizeScale === "large") return 1.12;
    return 1.0;
  }, [fontSizeScale]);

  const quranMultiplier = useMemo(() => {
    if (quranFontSizeScale === "small") return 0.9;
    if (quranFontSizeScale === "large") return 1.12;
    return 1.0;
  }, [quranFontSizeScale]);

  const S = useMemo(
    () => createStyles(colors),
    [colors],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(item.verseKey)}
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
          color={isActive ? "primary" : "subtext"}
        >
          ﴿ {item.verseKey} ﴾
        </AppText>
      </View>

      {/* Arabic text — centered, highlighted when active */}
      <View style={[S.arabicWrapper, isActive && S.activeArabicWrapper]}>
        <AppText
          size={fontSize.arabic * quranMultiplier}
          lineHeight={Math.round(fontSize.arabic * quranMultiplier * 2.2)}
          family="quran"
          letterSpacing={2.5}
          align="center"
          color={isActive ? "primary" : colors.quranVerse}
          style={S.arabicText}
        >
          {item.arabic}
        </AppText>
      </View>

      {/* Translation below arabic */}
      {selectedTransId !== "0" && item.translation ? (
        <AppText
          size={fontSize.title * textMultiplier}
          lineHeight={Math.round(fontSize.title * textMultiplier * 1.7)}
          family="text"
          color="text"
          align="center"
          style={S.translationText}
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
