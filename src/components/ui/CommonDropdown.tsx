import React from "react";
import { StyleSheet, View, Text, Modal, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";

export interface DropdownItem {
  label: string;
  value: string;
}

interface CommonDropdownProps {
  data: DropdownItem[];
  value: string;
  onChange: (item: DropdownItem) => void;
  placeholder?: string;
}

export default function CommonDropdown({
  data,
  value,
  onChange,
  placeholder = "Select option",
}: CommonDropdownProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedItem = data.find((d) => d.value === value);

  const S = createStyles(colors, fontFamily, fontSize);

  return (
    <>
      <TouchableOpacity
        style={S.dropdownButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={S.selectedText} numberOfLines={1}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={scale(16)} color={colors.subtext} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={S.overlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={S.modalContent}>
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>{placeholder}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={scale(20)} color={colors.subtext} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={data}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[S.itemRow, isSelected && S.selectedItemRow]}
                    onPress={() => {
                      onChange(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={[S.itemText, isSelected && S.selectedItemText]}>
                      {item.label}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={scale(18)} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
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
      paddingVertical: verticalScale(8),
    },
    selectedText: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
      flex: 1,
      marginRight: scale(6),
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: scale(20),
    },
    modalContent: {
      width: "100%",
      maxHeight: "60%",
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
    modalTitle: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.title,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(8),
      borderRadius: scale(8),
    },
    selectedItemRow: {
      backgroundColor: colors.primary + "12",
    },
    itemText: {
      color: colors.text,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
    },
    selectedItemText: {
      color: colors.primary,
      fontFamily: fontFamily.title,
    },
  });
