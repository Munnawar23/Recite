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
    ? (["#162320", "#0E1816"] as const)
    : (["#FFFFFF", "#F6FAF7"] as const);

  const watermarkColor = isDark
    ? "rgba(212, 168, 106, 0.20)"
    : "rgba(75, 133, 102, 0.18)";

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

      {/* Decorative Subtle Watermark */}
      {watermarkIcon && (
        <View style={S.watermarkContainer} pointerEvents="none">
          {watermarkFamily === "FontAwesome5" && (
            <FontAwesome5
              name={watermarkIcon}
              size={scale(52)}
              color={watermarkColor}
            />
          )}
          {watermarkFamily === "Ionicons" && (
            <Ionicons
              name={watermarkIcon as any}
              size={scale(52)}
              color={watermarkColor}
            />
          )}
          {watermarkFamily === "MaterialCommunityIcons" && (
            <MaterialCommunityIcons
              name={watermarkIcon as any}
              size={scale(52)}
              color={watermarkColor}
            />
          )}
        </View>
      )}

      {/* Top: Icon Badge (Filled with Primary Color) */}
      <View style={S.iconBadge}>
        <Ionicons
          name={icon}
          size={scale(19)}
          color="#FFFFFF"
        />
      </View>

      {/* Bottom: Title & Subtitle */}
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
          variant="caption"
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
      padding: scale(13),
      justifyContent: "space-between",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(212, 168, 106, 0.16)"
        : "rgba(75, 133, 102, 0.16)",
      backgroundColor: isDark ? "#141F1D" : "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.05,
      shadowRadius: 5,
      elevation: 2,
      position: "relative",
    },
    watermarkContainer: {
      position: "absolute",
      right: scale(7),
      top: scale(10),
    },
    iconBadge: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(12),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    contentContainer: {
      marginTop: verticalScale(10),
    },
    titleText: {
      fontWeight: "700",
      letterSpacing: 0.2,
      marginBottom: verticalScale(2),
    },
    subtitleText: {
      lineHeight: scale(14.5),
      opacity: 0.85,
    },
  });
