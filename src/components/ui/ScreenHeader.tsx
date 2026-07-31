import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Haptics } from "@/lib/haptics";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
}

export default function ScreenHeader({
  title,
  subtitle,
  onBackPress,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { isOffline } = useNetworkStatus();
  const S = createStyles(colors, fontFamily, fontSize, spacing, isOffline);

  const handleBack = () => {
    Haptics.medium();
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={S.container}>
      <TouchableOpacity
        style={S.backButton}
        onPress={handleBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={scale(22)} color={colors.text} />
      </TouchableOpacity>

      <View style={S.titleContainer}>
        <Text style={S.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={S.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={S.placeholder} />
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
  isOffline: boolean,
) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.screenPadding,
      paddingTop: verticalScale(6),
      paddingBottom: verticalScale(8),
      marginTop: isOffline ? verticalScale(2) : 0,
    },
    backButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: scale(12),
    },
    title: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.cardTitle,
      color: colors.text,
    },
    subtitle: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: colors.subtext,
      marginTop: verticalScale(2),
    },
    placeholder: {
      width: scale(36),
    },
  });
