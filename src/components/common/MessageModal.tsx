import Button from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale } from "react-native-size-matters";

interface MessageModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function MessageModal({
  visible,
  onClose,
  title,
  message,
  icon,
  iconColor,
}: MessageModalProps) {
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { t } = useTranslation();

  const handleClose = () => {
    Haptics.medium();
    onClose();
  };

  const S = createStyles(colors, fontFamily, fontSize, spacing);

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
                size={scale(28)}
                color={iconColor || colors.primary}
              />
            </View>
          )}

          {/* Title */}
          <Text style={S.title}>{title}</Text>

          {/* Message */}
          <Text style={S.message}>{message}</Text>

          {/* OK Button */}
          <Button
            title={t("common.ok", "OK")}
            onPress={handleClose}
            style={S.okButton}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
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
      borderRadius: scale(20),
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.screenPadding,
      alignItems: "center",
      gap: spacing.itemGap,
    },
    iconBadge: {
      width: scale(60),
      height: scale(60),
      borderRadius: scale(18),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.cardMarginTop,
    },
    title: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.cardTitle,
      color: colors.text,
      textAlign: "center",
    },
    message: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
      color: colors.subtext,
      textAlign: "center",
      lineHeight: fontSize.bodyLg * 1.55,
    },
    okButton: {
      marginTop: spacing.cardMarginTop,
    },
  });

export default MessageModal;
