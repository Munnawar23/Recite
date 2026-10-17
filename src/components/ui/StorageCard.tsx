import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { AppText } from "./AppText";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useDownloadsStore } from "@/store/downloadsStore";

interface StorageCardProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export default function StorageCard({ containerStyle }: StorageCardProps) {
  const { t } = useTranslation();
  const { colors, spacing, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const downloads = useDownloadsStore((s) => s.downloads);

  const { count, formattedValue, formattedUnit } = useMemo(() => {
    const entries = Object.values(downloads);
    const count = entries.length;
    const totalBytes = entries.reduce((sum, d) => sum + (d.totalBytes || 0), 0);

    if (totalBytes >= 1024 * 1024 * 1024) {
      return {
        count,
        formattedValue: (totalBytes / (1024 * 1024 * 1024)).toFixed(2),
        formattedUnit: "GB",
      };
    }

    return {
      count,
      formattedValue: (totalBytes / (1024 * 1024)).toFixed(1),
      formattedUnit: "MB",
    };
  }, [downloads]);

  const S = useMemo(
    () => createStyles(colors, spacing, isDark),
    [colors, spacing, isDark],
  );

  return (
    <View style={[S.wrapper, containerStyle]}>
      <LinearGradient
        colors={colors.hijriCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.gradient}
      >
        {/* Decorative background shapes */}
        <View style={S.decoCircleLarge} />
        <View style={S.decoCircleSmall} />

        {/* Top Header Row */}
        <View style={S.topRow}>
          <View style={S.badge}>
            <Ionicons
              name="cloud-done"
              size={rs.icon(13)}
              color={colors.hijriCardAccent}
            />
            <AppText
              variant="caption"
              family="title"
              fontWeight="600"
              color="#FFFFFF"
              letterSpacing={0.4}
              numberOfLines={1}
            >
              {t("library.storageCard.badge", t("library.tabs.downloads", "Available Offline"))}
            </AppText>
          </View>
        </View>

        {/* Main Content Row */}
        <View style={S.mainContent}>
          <AppText
            size={42}
            family="heading"
            color="#FFFFFF"
            lineHeight={rs.font(46)}
            style={S.sizeNumber}
          >
            {formattedValue}
          </AppText>

          <View style={S.dividerLine} />

          <View style={S.storageDetails}>
            <AppText
              size={20}
              family="heading"
              color="#FFFFFF"
              letterSpacing={0.4}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {formattedUnit} {t("library.storageCard.used", t("settings.storage.title", "Used"))}
            </AppText>
            <View style={S.detailsRow}>
              <AppText
                variant="bodySm"
                family="title"
                color={colors.hijriCardAccent}
                numberOfLines={1}
              >
                {count} {t("common.surah", "Surah")} {t("library.storageCard.downloaded", t("common.favorited", "Downloaded"))}
              </AppText>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
  isDark: boolean,
) =>
  StyleSheet.create({
    wrapper: {
      marginHorizontal: spacing.screenPadding,
      marginTop: 0,
      marginBottom: verticalScale(12),
      borderRadius: scale(22),
      shadowColor: isDark ? "#000000" : colors.hijriCardGradient[1],
      shadowOffset: {
        width: 0,
        height: verticalScale(7),
      },
      shadowOpacity: isDark ? 0.35 : 0.2,
      shadowRadius: scale(14),
      elevation: 6,
      backgroundColor: colors.hijriCardGradient[1],
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
    },
    gradient: {
      borderRadius: scale(22),
      paddingHorizontal: scale(18),
      paddingVertical: verticalScale(18),
      overflow: "hidden",
      position: "relative",
    },
    decoCircleLarge: {
      position: "absolute",
      top: -verticalScale(26),
      right: -scale(26),
      width: scale(130),
      height: scale(130),
      borderRadius: scale(65),
      backgroundColor: "rgba(255, 255, 255, 0.04)",
    },
    decoCircleSmall: {
      position: "absolute",
      bottom: -verticalScale(18),
      left: -scale(35),
      width: scale(90),
      height: scale(90),
      borderRadius: scale(45),
      backgroundColor: "rgba(255, 255, 255, 0.03)",
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      paddingHorizontal: scale(11),
      paddingVertical: verticalScale(4.5),
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    mainContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    sizeNumber: {
      includeFontPadding: false,
    },
    dividerLine: {
      width: 1,
      height: verticalScale(34),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      marginHorizontal: scale(13),
    },
    storageDetails: {
      flex: 1,
      justifyContent: "center",
      gap: verticalScale(3),
    },
    detailsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: scale(5),
    },
  });
