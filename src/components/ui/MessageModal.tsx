import Button from "@/components/ui/Button";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "./AppText";

interface MessageModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

export function MessageModal({
  visible,
  onClose,
  title,
  message,
  icon,
  iconColor,
  primaryButtonText,
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
}: MessageModalProps) {
  const { colors, spacing } = useAppTheme();
  const { t } = useTranslation();

  const handleClose = () => {
    Haptics.medium();
    onClose();
  };

  const handlePrimaryPress = () => {
    Haptics.medium();
    if (onPrimaryPress) {
      onPrimaryPress();
    } else {
      onClose();
    }
  };

  const handleSecondaryPress = () => {
    Haptics.medium();
    if (onSecondaryPress) {
      onSecondaryPress();
    } else {
      onClose();
    }
  };

  const S = createStyles(colors, spacing);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={S.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={S.container} onStartShouldSetResponder={() => true}>
          {/* Icon */}
          {icon && (
            <View
              style={[
                S.iconBadge,
                {
                  backgroundColor: (iconColor || colors.primary) + "18",
                },
              ]}
            >
              <Ionicons
                name={icon}
                size={rs.icon(28)}
                color={iconColor || colors.primary}
              />
            </View>
          )}

          {/* Title */}
          <AppText variant="cardTitle" color="text" family="title" align="center">
            {title}
          </AppText>

          {/* Message */}
          <AppText
            variant="bodyLg"
            color="subtext"
            align="center"
            style={S.message}
          >
            {message}
          </AppText>

          {/* Buttons */}
          <View style={S.buttonContainer}>
            {secondaryButtonText && (
              <Button
                title={secondaryButtonText}
                onPress={handleSecondaryPress}
                style={[S.actionButton, S.secondaryButton]}
                textStyle={S.secondaryButtonText}
              />
            )}
            <Button
              title={primaryButtonText || t("common.ok", "OK")}
              onPress={handlePrimaryPress}
              style={S.actionButton}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: spacing.screenPadding,
    },
    container: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: rs.space(20),
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.screenPadding,
      alignItems: "center",
      gap: spacing.itemGap,
    },
    iconBadge: {
      width: rs.space(60),
      height: rs.space(60),
      borderRadius: rs.space(18),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.cardMarginTop,
    },
    message: {
      lineHeight: rs.font(15) * 1.55,
    },
    buttonContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.itemGap,
      marginTop: spacing.cardMarginTop,
      width: "100%",
    },
    actionButton: {
      flex: 1,
    },
    secondaryButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryButtonText: {
      color: colors.text,
    },
  });

export default MessageModal;
