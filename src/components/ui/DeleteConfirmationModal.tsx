import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";

interface DeleteConfirmationModalProps {
  visible: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  visible,
  title,
  description,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const S = createStyles(colors, fontFamily, fontSize, isDark);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={S.overlay}>
        <View style={S.modalContainer}>
          <View style={S.iconCircle}>
            <Ionicons name="trash-outline" size={scale(24)} color="#E53E3E" />
          </View>

          <Text style={S.title}>{title}</Text>
          <Text style={S.description}>{description}</Text>

          <View style={S.buttonRow}>
            <TouchableOpacity style={S.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={S.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={S.deleteBtn} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={S.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(24),
    },
    modalContainer: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: scale(20),
      padding: scale(20),
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    iconCircle: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(24),
      backgroundColor: "rgba(229, 62, 62, 0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(12),
    },
    title: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.cardTitle,
      marginBottom: verticalScale(6),
      textAlign: "center",
    },
    description: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      textAlign: "center",
      lineHeight: fontSize.body * 1.5,
      marginBottom: verticalScale(18),
    },
    buttonRow: {
      flexDirection: "row",
      gap: scale(10),
      width: "100%",
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: verticalScale(10),
      borderRadius: scale(12),
      backgroundColor: colors.background,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelBtnText: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
    },
    deleteBtn: {
      flex: 1,
      paddingVertical: verticalScale(10),
      borderRadius: scale(12),
      backgroundColor: "#E53E3E",
      alignItems: "center",
    },
    deleteBtnText: {
      color: "#FFFFFF",
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
    },
  });
