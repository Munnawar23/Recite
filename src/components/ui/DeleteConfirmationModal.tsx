import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { AppText } from "./AppText";
import CommonModal from "./CommonModal";

interface DeleteConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteConfirmationModal({
  visible,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Clear",
  cancelText = "Cancel",
}: DeleteConfirmationModalProps) {
  const { colors } = useAppTheme();
  const S = createStyles(colors);

  if (!visible) return null;

  const handleConfirm = () => {
    Haptics.light();
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.light();
    onCancel();
  };

  return (
    <CommonModal visible={visible} title={title} onClose={handleCancel}>
      <View style={S.container}>
        <View style={S.iconCircle}>
          <Ionicons name="trash-outline" size={rs.icon(24)} color="#E53E3E" />
        </View>

        <AppText variant="bodyLg" color="text" align="center" style={S.description}>
          {description}
        </AppText>

        <View style={S.buttonRow}>
          <TouchableOpacity style={S.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
            <AppText variant="bodyLg" color="text" family="title">
              {cancelText}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={S.deleteBtn} onPress={handleConfirm} activeOpacity={0.8}>
            <AppText variant="bodyLg" color="#FFFFFF" family="title">
              {confirmText}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </CommonModal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingTop: rs.space(4),
      gap: rs.space(12),
    },
    iconCircle: {
      width: rs.space(52),
      height: rs.space(52),
      borderRadius: rs.space(26),
      backgroundColor: "rgba(229, 62, 62, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    description: {
      lineHeight: rs.font(15) * 1.45,
      paddingHorizontal: rs.space(4),
    },
    buttonRow: {
      flexDirection: "row",
      gap: rs.space(10),
      width: "100%",
      marginTop: rs.space(6),
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: rs.space(11),
      borderRadius: rs.space(12),
      backgroundColor: colors.background,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteBtn: {
      flex: 1,
      paddingVertical: rs.space(11),
      borderRadius: rs.space(12),
      backgroundColor: "#E53E3E",
      alignItems: "center",
    },
  });
