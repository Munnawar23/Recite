import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { useAppFonts } from "@/hooks/useAppFonts";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Haptics } from "@/lib/haptics";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";

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
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { isOffline } = useNetworkStatus();
  const S = createStyles(colors, fontFamily, fontSize, spacing, isOffline);

  const handlePress = () => {
    Haptics.medium();
    onRightIconPress?.();
  };

  return (
    <View style={S.headerRow}>
      <View style={S.topRow}>
        <Text style={S.titleText}>{title}</Text>
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
      {subtitle && <Text style={S.subtitleText}>{subtitle}</Text>}
    </View>
  );
}

type AppFonts = ReturnType<typeof useAppFonts>;

const createStyles = (
  colors: ThemeColors,
  fontFamily: AppFonts["fontFamily"],
  fontSize: AppFonts["fontSize"],
  spacing: ThemeSpacing,
  isOffline: boolean,
) =>
  StyleSheet.create({
    headerRow: {
      paddingHorizontal: spacing.screenPadding,
      paddingTop: 0,
      paddingBottom: spacing.vXs,
      marginTop: isOffline ? verticalScale(4) : 0,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    titleText: {
      fontSize: fontSize.heading,
      color: colors.text,
      fontFamily: fontFamily.heading,
      letterSpacing: 0.5,
      flex: 1,
    },
    iconButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.primary + "12",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: spacing.sm,
    },
    subtitleText: {
      fontSize: fontSize.body,
      color: colors.subtext,
      fontFamily: fontFamily.text,
      marginTop: spacing.vXs,
    },
  });
