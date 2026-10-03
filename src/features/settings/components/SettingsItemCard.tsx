import React, { useCallback, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { type ThemeColors, type ThemeSpacing } from "@/theme";
import { AppText } from "@/components";

interface SettingsItemCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
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
  const { colors, spacing } = useAppTheme();
  const effectiveIconColor = iconColor || colors.primary;

  const styles = useMemo(
    () => createStyles(colors, spacing, effectiveIconColor),
    [colors, spacing, effectiveIconColor],
  );

  const handlePress = useCallback(() => {
    if (!onPress) return;
    Haptics.medium();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.leftContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={rs.icon(20)} color={effectiveIconColor} />
        </View>

        <View style={styles.textContainer}>
          <AppText variant="bodyLg" family="title" color="text" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText
              variant="body"
              color="subtext"
              numberOfLines={1}
              style={styles.subtitle}
            >
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>

      {rightElement ? (
        <View style={styles.rightContainer}>{rightElement}</View>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={rs.icon(18)}
          color={colors.subtext}
        />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (
  colors: ThemeColors,
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
      borderRadius: rs.space(16),
      padding: rs.space(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    leftContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: rs.space(8),
    },
    iconContainer: {
      width: rs.space(40),
      height: rs.space(40),
      borderRadius: rs.space(11),
      alignItems: "center",
      justifyContent: "center",
      marginRight: rs.space(12),
      backgroundColor: iconColor + "18",
    },
    textContainer: {
      flex: 1,
    },
    subtitle: {
      marginTop: rs.space(2),
    },
    rightContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginLeft: rs.space(8),
    },
  });
