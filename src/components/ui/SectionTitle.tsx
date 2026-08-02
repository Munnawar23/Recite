import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize, spacing, tightSpacing);

  return (
    <View style={S.row}>
      <View style={S.leftRow}>
        {icon && (
          <View style={S.iconWrap}>
            <Ionicons name={icon} size={scale(14)} color={colors.primary} />
          </View>
        )}

        <Text style={S.text}>{label}</Text>
      </View>

      {isLoading ? (
        <View style={S.rightRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : rightText ? (
        <Text style={S.rightText}>{rightText}</Text>
      ) : null}
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
  tightSpacing?: boolean,
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: tightSpacing ? spacing.sectionHeaderTop - verticalScale(4) : spacing.sectionHeaderTop,
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
      width: scale(24),
      height: scale(24),
      borderRadius: scale(7),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontSize: scale(14),
      fontFamily: fontFamily.title,
      color: colors.primary,
      letterSpacing: 0.4,
    },
    rightText: {
      fontSize: fontSize.body,
      fontFamily: fontFamily.text,
      color: colors.subtext,
      marginRight: spacing.sm,
    },
  });
