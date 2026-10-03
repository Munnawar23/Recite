import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeColors, type ThemeSpacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import React from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AppText } from "./AppText";
import Button from "./Button";

type BaseProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  animationSource?: any;
  title: string;
  subtitle: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

type Props = BaseProps &
  (
    | {
        buttonLabel?: undefined;
        buttonIcon?: undefined;
        onPress?: undefined;
      }
    | {
        buttonLabel: string;
        buttonIcon?: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
      }
  );

export default function EmptyState({
  icon = "folder-open-outline",
  animationSource,
  title,
  subtitle,
  loading = false,
  buttonLabel,
  buttonIcon = "arrow-forward",
  onPress,
  style,
}: Props) {
  const { colors, spacing } = useAppTheme();
  const S = createStyles(colors, spacing);

  return (
    <View style={[S.container, style]}>
      {animationSource ? (
        <LottieView
          source={animationSource}
          autoPlay
          loop
          style={S.animation}
        />
      ) : (
        <View style={S.iconCircle}>
          <Ionicons name={icon} size={rs.icon(34)} color={colors.primary} />
        </View>
      )}

      <AppText variant="title" color="text" align="center">
        {title}
      </AppText>
      <AppText variant="body" color="subtext" align="center">
        {subtitle}
      </AppText>

      {buttonLabel && onPress && (
        <Button
          title={buttonLabel}
          icon={buttonIcon}
          loading={loading}
          onPress={onPress}
          style={S.buttonContainer}
        />
      )}
    </View>
  );
}

const createStyles = (
  colors: ThemeColors,
  spacing: ThemeSpacing,
) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.vXxl,
      alignItems: "center",
      gap: spacing.vSm,
    },
    iconCircle: {
      width: rs.space(68),
      height: rs.space(68),
      borderRadius: rs.space(34),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.vSm,
    },
    animation: {
      width: rs.space(200),
      height: rs.space(200),
      marginBottom: spacing.vSm,
    },
    buttonContainer: {
      marginTop: spacing.vSm,
      width: "auto",
      alignSelf: "center",
      paddingHorizontal: spacing.xxl,
      borderRadius: rs.space(30),
    },
  });
