import { useAppTheme } from "@/hooks/useAppTheme";
import { useFontStore } from "@/store/fontStore";
import type { SurahVerse } from "@/types/quran";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

interface VerseRowProps {
  item: SurahVerse;
  selectedTransId: string;
  isActive?: boolean;
  onLayout?: (y: number) => void;
  onPress?: () => void;
}

export default function VerseRow({
  item,
  selectedTransId,
  isActive,
  onLayout,
  onPress,
}: VerseRowProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const { fontSizeScale, quranFontSizeScale } = useFontStore();

  let textMultiplier = 1.0;
  if (fontSizeScale === "small") textMultiplier = 0.85;
  else if (fontSizeScale === "large") textMultiplier = 1.25;

  let quranMultiplier = 1.0;
  if (quranFontSizeScale === "small") quranMultiplier = 0.85;
  else if (quranFontSizeScale === "large") quranMultiplier = 1.25;

  const S = createStyles(
    colors,
    fontFamily,
    fontSize,
    textMultiplier,
    quranMultiplier,
  );

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
        <Text style={S.translationText}>{item.translation}</Text>
      ) : null}

      {/* Thin separator */}
      <View style={S.verseSeparator} />
    </TouchableOpacity>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  textMultiplier: number,
  quranMultiplier: number,
) =>
  StyleSheet.create({
    verseRow: {
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(12),
      paddingHorizontal: 0,
      marginVertical: verticalScale(4),
      width: "100%",
    },
    arabicWrapper: {
      paddingVertical: verticalScale(8),
      paddingHorizontal: 0,
      borderRadius: scale(12),
      width: "100%",
    },
    activeArabicWrapper: {
      backgroundColor: colors.primary + "18",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    verseSeparator: {
      height: 1,
      backgroundColor: colors.primary + "50",
      marginTop: verticalScale(14),
    },
    arabicText: {
      color: colors.primary,
      fontFamily: fontFamily.quran,
      fontSize: (fontSize.arabic + 3) * quranMultiplier,
      lineHeight: (fontSize.arabic + 3) * quranMultiplier * 2.2,
      letterSpacing: 2.5,
      textAlign: "center",
      width: "100%",
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
      fontSize: fontSize.title * textMultiplier,
      lineHeight: fontSize.title * textMultiplier * 1.7,
      marginTop: verticalScale(10),
      textAlign: "center",
      paddingHorizontal: 0,
      width: "100%",
    },
  });
