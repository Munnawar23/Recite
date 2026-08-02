import React, { useState, useEffect, useRef, useMemo } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { scale, verticalScale } from "react-native-size-matters";

interface DownloadCardProps {
  chapterId?: number;
  reciterName?: string;
  selectedTransId?: string;
}

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];
type ThemeFontFamily = ReturnType<typeof useAppTheme>["fontFamily"];
type ThemeFontSize = ReturnType<typeof useAppTheme>["fontSize"];

/* Circular Progress Indicator for Download State */
function CircularProgressControl({
  progress,
  onCancel,
  primaryColor,
  trackColor,
}: {
  progress: number;
  onCancel: () => void;
  primaryColor: string;
  trackColor: string;
}) {
  const size = scale(32);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress || 0) * circumference;

  return (
    <Pressable
      onPressIn={onCancel}
      accessibilityRole="button"
      accessibilityLabel="Cancel Download"
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Ionicons name="close" size={scale(14)} color={primaryColor} />
    </Pressable>
  );
}

function DownloadCard({ reciterName = "Mishary Rashid Alafasy" }: DownloadCardProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartDownload = () => {
    Haptics.medium();
    setIsDownloading(true);
    setIsDownloaded(false);
    setProgress(0);

    const stepMs = 50; // 50ms interval * 100 steps = 5 seconds total
    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsDownloading(false);
          setIsDownloaded(true);
          Haptics.success();
          return 1;
        }
        return prev + 0.01;
      });
    }, stepMs);
  };

  const handleCancelDownload = () => {
    Haptics.medium();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsDownloading(false);
    setProgress(0);
  };

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
            name={isDownloaded ? "checkmark-circle-outline" : "download-outline"}
            size={scale(20)}
            color={colors.primary}
          />
        </View>

        {/* Text Area */}
        <View style={S.textContainer}>
          <Text numberOfLines={1} style={S.title}>
            {isDownloaded
              ? t("quran.downloadCard.downloaded", "Downloaded")
              : isDownloading
              ? `${Math.round(progress * 100)}%`
              : t("quran.downloadCard.download", "Download")}
          </Text>
          <Text numberOfLines={1} style={S.subtitle}>
            {reciterName}
          </Text>
        </View>

        {/* Right Action */}
        <View style={S.rightAction}>
          {isDownloading ? (
            <CircularProgressControl
              progress={progress}
              onCancel={handleCancelDownload}
              primaryColor={colors.primary}
              trackColor={colors.border}
            />
          ) : isDownloaded ? (
            <TouchableOpacity
              style={[S.downloadBtn, S.downloadedBtn]}
              activeOpacity={0.8}
              onPress={handleStartDownload}
            >
              <Ionicons name="checkmark" size={scale(14)} color={colors.primary} />
              <Text style={[S.downloadBtnText, { color: colors.primary }]}>
                {t("quran.downloadCard.downloaded", "Downloaded")}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={S.downloadBtn}
              activeOpacity={0.8}
              onPress={handleStartDownload}
              accessibilityRole="button"
              accessibilityLabel={t("quran.downloadCard.download", "Download Surah")}
            >
              <Ionicons name="download-outline" size={scale(14)} color={colors.card} />
              <Text style={S.downloadBtnText}>
                {t("quran.downloadCard.download", "Download")}
              </Text>
            </TouchableOpacity>
          )}
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
      alignItems: "center",
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
    downloadedBtn: {
      backgroundColor: colors.primary + "15",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    downloadBtnText: {
      color: colors.card,
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption,
    },
  });
