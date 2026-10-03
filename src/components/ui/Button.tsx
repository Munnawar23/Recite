import { rs, scale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { AppText } from "./AppText";

export interface ButtonProps {
  title?: string;
  tx?: string;
  txOptions?: Record<string, unknown>;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  children?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<any>;
}

export function Button({
  title,
  tx,
  txOptions,
  onPress,
  icon,
  children,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const styles = createStyles(colors, spacing);
  const buttonTitle = tx ? t(tx, txOptions) : title;

  const handlePress = () => {
    Haptics.medium();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.card} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons name={icon} size={rs.icon(18)} color={colors.card} />
          )}
          {buttonTitle ? (
            <AppText
              variant="body"
              color="card"
              family="title"
              style={[styles.text, textStyle]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {buttonTitle}
            </AppText>
          ) : null}
          {children}
        </>
      )}
    </Pressable>
  );
}

const createStyles = (colors: any, spacing: any) =>
  StyleSheet.create({
    button: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: rs.space(12),
      paddingVertical: spacing.vMd,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
      backgroundColor: colors.primary,
      opacity: 1,
    },
    disabled: {
      opacity: 0.6,
    },
    pressed: {
      opacity: 0.8,
    },
    text: {
      color: colors.card,
    },
  });

export default Button;
