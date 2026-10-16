import React from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { AppText } from "@/components";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { type ThemeColors } from "@/theme";

export interface ExploreCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  watermarkIcon?: string;
  watermarkFamily?: "FontAwesome5" | "Ionicons" | "MaterialCommunityIcons";
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ExploreCard({
  title,
  subtitle,
  icon,
  watermarkIcon,
  watermarkFamily = "FontAwesome5",
  onPress,
  style,
}: ExploreCardProps) {
  const { colors, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const S = createStyles(colors, isDark);

  const handlePress = () => {
    Haptics.light();
    onPress();
  };

  const gradientColors = isDark
    ? (["#152824", "#0D1B18"] as const)
    : (["#FFFFFF", "#F4F8F5"] as const);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={[S.container, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Watermark */}
      {watermarkIcon && (
        <View style={S.watermarkContainer} pointerEvents="none">
          {watermarkFamily === "FontAwesome5" && (
            <FontAwesome5
              name={watermarkIcon}
              size={scale(56)}
              color={
                isDark
                  ? "rgba(212, 168, 106, 0.24)"
                  : "rgba(75, 133, 102, 0.22)"
              }
            />
          )}
          {watermarkFamily === "Ionicons" && (
            <Ionicons
              name={watermarkIcon as any}
              size={scale(56)}
              color={
                isDark
                  ? "rgba(212, 168, 106, 0.24)"
                  : "rgba(75, 133, 102, 0.22)"
              }
            />
          )}
          {watermarkFamily === "MaterialCommunityIcons" && (
            <MaterialCommunityIcons
              name={watermarkIcon as any}
              size={scale(56)}
              color={
                isDark
                  ? "rgba(212, 168, 106, 0.24)"
                  : "rgba(75, 133, 102, 0.22)"
              }
            />
          )}
        </View>
      )}

      {/* Top Section: Icon Badge */}
      <View style={S.iconBadge}>
        <Ionicons
          name={icon}
          size={scale(19)}
          color={colors.accent}
        />
      </View>

      {/* Bottom Content: Title & Subtitle */}
      <View style={S.contentContainer}>
        <AppText
          variant="body"
          family="title"
          color="text"
          numberOfLines={1}
          style={S.titleText}
        >
          {title}
        </AppText>
        <AppText
          variant="bodySm"
          color="subtext"
          numberOfLines={2}
          style={S.subtitleText}
        >
          {subtitle}
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: scale(146),
      minHeight: scale(124),
      borderRadius: rs.space(16),
      padding: scale(12),
      justifyContent: "space-between",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(212, 168, 106, 0.12)" : colors.border,
      position: "relative",
    },
    watermarkContainer: {
      position: "absolute",
      right: scale(-2),
      top: scale(4),
    },
    iconBadge: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      backgroundColor: isDark
        ? "rgba(212, 168, 106, 0.12)"
        : "rgba(184, 130, 61, 0.12)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(212, 168, 106, 0.28)"
        : "rgba(184, 130, 61, 0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
    contentContainer: {
      marginTop: verticalScale(10),
    },
    titleText: {
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    subtitleText: {
      marginTop: verticalScale(2),
      lineHeight: scale(14),
      opacity: 0.85,
    },
  });
