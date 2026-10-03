import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
  isLoading?: boolean;
  tightSpacing?: boolean;
}

export default function SectionTitle({
  label,
  icon,
  rightText,
  isLoading,
  tightSpacing,
}: Props) {
  const { colors, spacing } = useAppTheme();
  const S = createStyles(colors, spacing, tightSpacing);

  return (
    <View style={S.row}>
      <View style={S.leftRow}>
        {icon && (
          <View style={S.iconWrap}>
            <Ionicons name={icon} size={rs.icon(14)} color={colors.primary} />
          </View>
        )}

        <AppText
          variant="bodyLg"
          color="primary"
          family="title"
          letterSpacing={0.4}
        >
          {label}
        </AppText>
      </View>

      {isLoading ? (
        <View style={S.rightRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : rightText ? (
        <AppText variant="body" color="subtext" style={S.rightText}>
          {rightText}
        </AppText>
      ) : null}
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
  tightSpacing?: boolean,
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: tightSpacing
        ? spacing.sectionHeaderTop - rs.space(4)
        : spacing.sectionHeaderTop,
      marginBottom: spacing.sectionHeaderBottom,
      paddingHorizontal: spacing.screenPadding,
    },
    leftRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    rightRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: spacing.sm,
    },
    iconWrap: {
      width: rs.space(24),
      height: rs.space(24),
      borderRadius: rs.space(7),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    rightText: {
      marginRight: spacing.sm,
    },
  });
