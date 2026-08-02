import React, { useMemo } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";

interface DownloadCardProps {
  chapterId?: number;
  reciterName?: string;
  selectedTransId?: string;
}

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];
type ThemeFontFamily = ReturnType<typeof useAppTheme>["fontFamily"];
type ThemeFontSize = ReturnType<typeof useAppTheme>["fontSize"];

function DownloadCard({ reciterName = "Mishary Rashid Alafasy" }: DownloadCardProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const S = useMemo(
    () => createStyles(colors, fontFamily, fontSize, isDark),
    [colors, fontFamily, fontSize, isDark],
  );

  return (
    <View style={S.container}>
      <View style={S.cardContent}>
        {/* Left Squircle Icon */}
        <View style={[S.squircle, { backgroundColor: colors.primary + "20" }]}>
          <Ionicons
            name="download-outline"
            size={scale(20)}
            color={colors.primary}
          />
        </View>

        {/* Text Area */}
        <View style={S.textContainer}>
          <Text numberOfLines={1} style={S.title}>
            {t("quran.downloadCard.download", "Download")}
          </Text>
          <Text numberOfLines={1} style={S.subtitle}>
            {reciterName}
          </Text>
        </View>

        {/* Right Action */}
        <View style={S.rightAction}>
          <TouchableOpacity
            style={S.downloadBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t("quran.downloadCard.download", "Download Surah")}
          >
            <Ionicons name="download-outline" size={scale(14)} color={colors.card} />
            <Text style={S.downloadBtnText}>
              {t("quran.downloadCard.download", "Download")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default React.memo(DownloadCard);

const createStyles = (
  colors: ThemeColors,
  fontFamily: ThemeFontFamily,
  fontSize: ThemeFontSize,
  _isDark: boolean,
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      marginHorizontal: 0,
      marginTop: verticalScale(12),
      marginBottom: verticalScale(4),
      borderRadius: scale(16),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
    },
    squircle: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      flex: 1,
      marginLeft: scale(12),
      marginRight: scale(8),
    },
    title: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
    },
    subtitle: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
      marginTop: verticalScale(2),
    },
    rightAction: {
      justifyContent: "center",
    },
    downloadBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: colors.primary,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: scale(20),
    },
    downloadBtnText: {
      color: colors.card,
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption,
    },
  });
