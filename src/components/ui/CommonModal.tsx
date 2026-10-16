import React from "react";
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { Image } from "expo-image";
import { AppText } from "./AppText";

export interface DropdownItem {
  label: string;
  value: string;
  avatar?: any;
}

interface CommonModalProps {
  // Dropdown trigger mode props
  data?: DropdownItem[];
  value?: string;
  onChange?: (item: DropdownItem) => void;
  placeholder?: string;

  // Presentation mode: "bottom" (half-screen bottom sheet) or "center" (floating dialog)
  presentation?: "bottom" | "center";

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
  presentation = "bottom",
  visible: propVisible,
  onClose: propOnClose,
  title: propTitle,
  icon,
  iconColor,
  children,
}: CommonModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [internalVisible, setInternalVisible] = React.useState(false);

  const isControlled = propVisible !== undefined;
  const modalVisible = isControlled ? propVisible : internalVisible;

  const handleClose = () => {
    Haptics.light();
    if (isControlled && propOnClose) {
      propOnClose();
    } else {
      setInternalVisible(false);
    }
  };

  const handleOpen = () => {
    Haptics.light();
    setInternalVisible(true);
  };

  const handleSelect = (item: DropdownItem) => {
    Haptics.light();
    if (onChange) onChange(item);
    if (isControlled && propOnClose) {
      propOnClose();
    } else {
      setInternalVisible(false);
    }
  };

  const selectedItem = data ? data.find((d) => d.value === value) : undefined;
  const modalTitle = propTitle || placeholder;
  const isBottom = presentation === "bottom";
  const S = createStyles(colors, insets.bottom, isBottom);

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

      <Modal
        visible={modalVisible}
        transparent
        animationType={isBottom ? "slide" : "fade"}
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={S.overlay}>
          {/* Backdrop tap area */}
          <TouchableWithoutFeedback onPress={handleClose} accessibilityRole="button">
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={S.modalContent}>
            {/* Drag handle indicator for bottom sheet */}
            {isBottom && (
              <View style={S.dragHandleContainer}>
                <View style={S.dragHandle} />
              </View>
            )}

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
                showsVerticalScrollIndicator={true}
                persistentScrollbar={Platform.OS === "android"}
                style={S.list}
                contentContainerStyle={S.listContentContainer}
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <TouchableOpacity
                      style={[S.itemRow, isSelected && S.selectedItemRow]}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                    >
                      {item.avatar && (
                        <Image
                          source={item.avatar}
                          style={S.itemAvatar}
                          contentFit="cover"
                        />
                      )}
                      <AppText
                        variant="bodyLg"
                        family={isSelected ? "title" : "text"}
                        color={isSelected ? "primary" : "text"}
                        style={{ flex: 1 }}
                        numberOfLines={1}
                      >
                        {item.label}
                      </AppText>
                      {isSelected && <Ionicons name="checkmark-circle" size={rs.icon(20)} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any, bottomInset: number, isBottom: boolean) =>
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
      justifyContent: isBottom ? "flex-end" : "center",
      alignItems: isBottom ? "stretch" : "center",
      paddingHorizontal: isBottom ? 0 : rs.space(20),
    },
    modalContent: {
      width: "100%",
      maxHeight: isBottom ? "70%" : "80%",
      backgroundColor: colors.card,
      borderTopLeftRadius: rs.space(22),
      borderTopRightRadius: rs.space(22),
      borderBottomLeftRadius: isBottom ? 0 : rs.space(16),
      borderBottomRightRadius: isBottom ? 0 : rs.space(16),
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomWidth: isBottom ? 0 : 1,
      paddingHorizontal: rs.space(18),
      paddingTop: isBottom ? rs.space(8) : rs.space(16),
      paddingBottom: isBottom ? Math.max(bottomInset + rs.space(8), rs.space(18)) : rs.space(16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 20,
    },
    dragHandleContainer: {
      alignItems: "center",
      paddingVertical: rs.space(6),
      marginBottom: rs.space(4),
    },
    dragHandle: {
      width: rs.space(38),
      height: rs.space(4),
      borderRadius: rs.space(2),
      backgroundColor: colors.border,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: rs.space(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: rs.space(6),
    },
    modalHeaderTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(10),
      flex: 1,
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
    list: {
      flexShrink: 1,
    },
    listContentContainer: {
      paddingVertical: rs.space(4),
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: rs.space(13),
      paddingHorizontal: rs.space(12),
      borderRadius: rs.space(10),
      marginVertical: rs.space(2),
    },
    selectedItemRow: {
      backgroundColor: colors.primary + "15",
    },
    itemAvatar: {
      width: rs.space(36),
      height: rs.space(36),
      borderRadius: rs.space(18),
      marginRight: rs.space(12),
      backgroundColor: colors.border,
    },
  });
