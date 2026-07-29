import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import CommonModal from "./CommonModal";
import { Haptics } from "@/lib/haptics";

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
  const { colors, fontFamily, fontSize } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize);

  if (!visible) return null;

  const handleConfirm = () => {
    Haptics.medium();
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.medium();
    onCancel();
  };

  return (
    <CommonModal visible={visible} title={title} onClose={handleCancel}>
      <View style={S.container}>
        <View style={S.iconCircle}>
          <Ionicons name="trash-outline" size={scale(24)} color="#E53E3E" />
        </View>

        <Text style={S.description}>{description}</Text>

        <View style={S.buttonRow}>
          <TouchableOpacity style={S.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
            <Text style={S.cancelBtnText}>{cancelText}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.deleteBtn} onPress={handleConfirm} activeOpacity={0.8}>
            <Text style={S.deleteBtnText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CommonModal>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingTop: verticalScale(4),
      gap: verticalScale(12),
    },
    iconCircle: {
      width: scale(52),
      height: scale(52),
      borderRadius: scale(26),
      backgroundColor: "rgba(229, 62, 62, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    description: {
      color: colors.text,
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
      textAlign: "center",
      lineHeight: fontSize.bodyLg * 1.45,
      paddingHorizontal: scale(4),
    },
    buttonRow: {
      flexDirection: "row",
      gap: scale(10),
      width: "100%",
      marginTop: verticalScale(6),
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: verticalScale(11),
      borderRadius: scale(12),
      backgroundColor: colors.background,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelBtnText: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
    },
    deleteBtn: {
      flex: 1,
      paddingVertical: verticalScale(11),
      borderRadius: scale(12),
      backgroundColor: "#E53E3E",
      alignItems: "center",
    },
    deleteBtnText: {
      color: "#FFFFFF",
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
    },
  });
