import React from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { AppText } from "./AppText";

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
  const { colors } = useAppTheme();
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
  const S = createStyles(colors);

  return (
    <>
      {!isControlled && data && (
        <TouchableOpacity
          style={S.dropdownButton}
          onPress={handleOpen}
          activeOpacity={0.8}
        >
          <AppText
            variant="bodyLg"
            family="title"
            color="text"
            numberOfLines={1}
            style={S.selectedText}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </AppText>
          <Ionicons name="chevron-down" size={rs.icon(18)} color={colors.subtext} />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleClose}>
        <TouchableOpacity style={S.overlay} activeOpacity={1} onPress={handleClose}>
          <View style={S.modalContent} onStartShouldSetResponder={() => true}>
            <View style={S.modalHeader}>
              <View style={S.modalHeaderTitleRow}>
                {icon && (
                  <View style={[S.headerIconBadge, { backgroundColor: (iconColor || colors.primary) + "18" }]}>
                    <Ionicons name={icon} size={rs.icon(18)} color={iconColor || colors.primary} />
                  </View>
                )}
                <AppText variant="cardTitle" family="title" color="text" numberOfLines={1}>
                  {modalTitle}
                </AppText>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={rs.icon(22)} color={colors.subtext} />
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
                      <AppText
                        variant="bodyLg"
                        family={isSelected ? "title" : "text"}
                        color={isSelected ? "primary" : "text"}
                      >
                        {item.label}
                      </AppText>
                      {isSelected && <Ionicons name="checkmark" size={rs.icon(20)} color={colors.primary} />}
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    dropdownButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: rs.space(10),
      paddingHorizontal: rs.space(12),
      paddingVertical: rs.space(10),
    },
    selectedText: {
      flex: 1,
      marginRight: rs.space(6),
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: rs.space(20),
    },
    modalContent: {
      width: "100%",
      maxHeight: "80%",
      backgroundColor: colors.card,
      borderRadius: rs.space(16),
      borderWidth: 1,
      borderColor: colors.border,
      padding: rs.space(16),
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: rs.space(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: rs.space(8),
    },
    modalHeaderTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(10),
    },
    headerIconBadge: {
      width: rs.space(32),
      height: rs.space(32),
      borderRadius: rs.space(9),
      alignItems: "center",
      justifyContent: "center",
    },
    customContent: {
      flexShrink: 1,
      paddingVertical: rs.space(4),
    },
    customContentContainer: {
      paddingBottom: rs.space(16),
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: rs.space(12),
      paddingHorizontal: rs.space(10),
      borderRadius: rs.space(8),
    },
    selectedItemRow: {
      backgroundColor: colors.primary + "12",
    },
  });
