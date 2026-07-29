import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale } from "react-native-size-matters";

import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";

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
  const S = createStyles(colors, fontFamily, fontSize, spacing);

  const handlePress = () => {
    Haptics.medium();
    onPress();
  };

  return (
    <TouchableOpacity
      style={S.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={S.leftContainer}>
        <View style={[S.iconContainer, { backgroundColor: (iconColor || colors.primary) + "18" }]}>
          <Ionicons name={icon} size={scale(20)} color={iconColor || colors.primary} />
        </View>

        <View style={S.textContainer}>
          <Text style={S.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={S.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightElement ? (
        <View style={S.rightContainer}>{rightElement}</View>
      ) : (
        <Ionicons name="chevron-forward" size={scale(18)} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any
): {
  card: ViewStyle;
  leftContainer: ViewStyle;
  iconContainer: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  rightContainer: ViewStyle;
} =>
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
