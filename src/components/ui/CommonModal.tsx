import React from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import { Haptics } from "@/lib/haptics";

export interface DropdownItem {
  label: string;
  value: string;
}

interface CommonModalProps {
  // Dropdown trigger mode props
  data?: DropdownItem[];
  value?: string;
  onChange?: (item: DropdownItem) => void;
  placeholder?: string;

  // Direct modal mode props
  visible?: boolean;
  onClose?: () => void;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  confirmButtonText?: string;
  onConfirm?: () => void;
  children?: React.ReactNode;
}

export default function CommonModal({
  data,
  value,
  onChange,
  placeholder = "Select option",
  visible: propVisible,
  onClose: propOnClose,
  title: propTitle,
  icon,
  iconColor,
  children,
}: CommonModalProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const [internalVisible, setInternalVisible] = React.useState(false);

  const isControlled = propVisible !== undefined;
  const modalVisible = isControlled ? propVisible : internalVisible;

  const handleClose = () => {
    Haptics.medium();
    if (isControlled && propOnClose) {
      propOnClose();
    } else {
      setInternalVisible(false);
    }
  };

  const handleOpen = () => {
    Haptics.medium();
    setInternalVisible(true);
  };

  const handleSelect = (item: DropdownItem) => {
    Haptics.medium();
    if (onChange) onChange(item);
    setInternalVisible(false);
  };

  const selectedItem = data ? data.find((d) => d.value === value) : undefined;
  const modalTitle = propTitle || placeholder;
  const S = createStyles(colors, fontFamily, fontSize);

  return (
    <>
      {!isControlled && data && (
        <TouchableOpacity
          style={S.dropdownButton}
          onPress={handleOpen}
          activeOpacity={0.8}
        >
          <Text style={S.selectedText} numberOfLines={1}>
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
          <Ionicons name="chevron-down" size={scale(18)} color={colors.subtext} />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableOpacity style={S.overlay} activeOpacity={1} onPress={handleClose}>
          <View style={S.modalContent} onStartShouldSetResponder={() => true}>
            <View style={S.modalHeader}>
              <View style={S.modalHeaderTitleRow}>
                {icon && (
                  <View style={[S.headerIconBadge, { backgroundColor: (iconColor || colors.primary) + "18" }]}>
                    <Ionicons name={icon} size={scale(18)} color={iconColor || colors.primary} />
                  </View>
                )}
                <Text style={S.modalTitle}>{modalTitle}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={scale(22)} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            {children ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={S.customContent}
                contentContainerStyle={S.customContentContainer}
              >
                {children}
              </ScrollView>
            ) : data ? (
              <FlatList
                data={data}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <TouchableOpacity
                      style={[S.itemRow, isSelected && S.selectedItemRow]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={[S.itemText, isSelected && S.selectedItemText]}>
                        {item.label}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={scale(20)} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any) =>
  StyleSheet.create({
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: scale(10),
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(10),
    },
    selectedText: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      flex: 1,
      marginRight: scale(6),
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(20),
    },
    modalContent: {
      width: "100%",
      maxHeight: "80%",
      backgroundColor: colors.card,
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: colors.border,
      padding: scale(16),
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: verticalScale(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: verticalScale(8),
    },
    modalHeaderTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    headerIconBadge: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(9),
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.cardTitle,
    },
    customContent: {
      flexShrink: 1,
      paddingVertical: verticalScale(4),
    },
    customContentContainer: {
      paddingBottom: verticalScale(16),
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(10),
      borderRadius: scale(8),
    },
    selectedItemRow: {
      backgroundColor: colors.primary + "12",
    },
    itemText: {
      color: colors.text,
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
    },
    selectedItemText: {
      color: colors.primary,
      fontFamily: fontFamily.title,
    },
  });
