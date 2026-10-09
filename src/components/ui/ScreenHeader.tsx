import { rs } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Haptics } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "./AppText";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  titleFontSize?: number;
}

export default function ScreenHeader({
  title,
  subtitle,
  onBackPress,
  titleFontSize,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { colors, spacing } = useAppTheme();
  const { isOffline } = useNetworkStatus();
  const { paddingTop } = useAppSafeAreaInsets();
  const S = createStyles(colors, spacing, isOffline, paddingTop);

  const handleBack = () => {
    Haptics.light();
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
        <Ionicons name="chevron-back" size={rs.icon(22)} color={colors.text} />
      </TouchableOpacity>

      <View style={S.titleContainer}>
        <AppText
          variant="cardTitle"
          color="text"
          family="title"
          size={titleFontSize}
          numberOfLines={1}
          align="center"
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            variant="body"
            color="text"
            family="title"
            numberOfLines={1}
            align="center"
            style={S.subtitle}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={S.placeholder} />
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
  isOffline: boolean,
  paddingTop: number,
) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.screenPadding,
      paddingTop: paddingTop + rs.space(6),
      paddingBottom: rs.space(8),
      marginTop: isOffline ? rs.space(2) : 0,
    },
    backButton: {
      width: rs.space(36),
      height: rs.space(36),
      borderRadius: rs.space(18),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: rs.space(12),
    },
    subtitle: {
      marginTop: rs.space(2),
      opacity: 0.9,
    },
    placeholder: {
      width: rs.space(36),
    },
  });
