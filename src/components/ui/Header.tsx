import { rs } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Haptics } from "@/lib/haptics";
import { type ThemeColors, type ThemeSpacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "./AppText";

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export default function Header({
  title,
  subtitle,
  rightIcon,
  onRightIconPress,
}: HeaderProps) {
  const { colors, fontSize, spacing } = useAppTheme();
  const { isOffline } = useNetworkStatus();
  const { paddingTop } = useAppSafeAreaInsets();
  const S = createStyles(colors, spacing, isOffline, paddingTop);

  const handlePress = () => {
    Haptics.medium();
    onRightIconPress?.();
  };

  return (
    <View style={S.headerRow}>
      <View style={S.topRow}>
        <AppText
          variant="heading"
          color="text"
          style={S.titleText}
          numberOfLines={1}
        >
          {title}
        </AppText>
        {rightIcon && (
          <TouchableOpacity
            style={S.iconButton}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={rightIcon}
              size={fontSize.heading}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      {subtitle && (
        <AppText
          variant="body"
          color="text"
          family="title"
          style={S.subtitleText}
        >
          {subtitle}
        </AppText>
      )}
    </View>
  );
}

const createStyles = (
  colors: ThemeColors,
  spacing: ThemeSpacing,
  isOffline: boolean,
  paddingTop: number,
) =>
  StyleSheet.create({
    headerRow: {
      paddingHorizontal: spacing.screenPadding,
      paddingTop: paddingTop,
      paddingBottom: spacing.vXs,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    titleText: {
      flex: 1,
    },
    iconButton: {
      width: rs.space(36),
      height: rs.space(36),
      borderRadius: rs.space(18),
      backgroundColor: colors.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.sm,
    },
    subtitleText: {
      marginTop: spacing.vXs,
      opacity: 0.9,
    },
  });
