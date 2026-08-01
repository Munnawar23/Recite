import React, { useMemo, useCallback } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale } from "react-native-size-matters";

import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";

type ThemeObject = ReturnType<typeof useAppTheme>;

interface SettingsItemCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  rightElement?: React.ReactNode;
}

export default function SettingsItemCard({
  icon,
  title,
  subtitle,
  onPress,
  iconColor,
  rightElement,
}: SettingsItemCardProps) {
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const effectiveIconColor = iconColor || colors.primary;

  const styles = useMemo(
    () => createStyles(colors, fontFamily, fontSize, spacing, effectiveIconColor),
    [colors, fontFamily, fontSize, spacing, effectiveIconColor],
  );

  const handlePress = useCallback(() => {
    Haptics.medium();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={scale(20)} color={effectiveIconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightElement ? (
        <View style={styles.rightContainer}>{rightElement}</View>
      ) : (
        <Ionicons name="chevron-forward" size={scale(18)} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (
  colors: ThemeColors,
  fontFamily: ThemeObject["fontFamily"],
  fontSize: ThemeObject["fontSize"],
  spacing: ThemeSpacing,
  iconColor: string,
) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginBottom: spacing.itemGap,
      borderRadius: scale(16),
      padding: scale(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: scale(8),
    },
    iconContainer: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(11),
      alignItems: "center",
      justifyContent: "center",
      marginRight: scale(12),
      backgroundColor: iconColor + "18",
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      color: colors.text,
    },
    subtitle: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: colors.subtext,
      marginTop: verticalScale(2),
    },
    rightContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginLeft: scale(8),
    },
  });
