import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { scale } from "react-native-size-matters";

import { useAppTheme } from "@/hooks/useAppTheme";

interface Props {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
}

export default function SectionTitle({ label, icon, rightText }: Props) {
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize, spacing);

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

      {rightText ? <Text style={S.rightText}>{rightText}</Text> : null}
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: spacing.sectionHeaderTop,
      marginBottom: spacing.sectionHeaderBottom,
      paddingHorizontal: spacing.screenPadding,
    },
    leftRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
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
