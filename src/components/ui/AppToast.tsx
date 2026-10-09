import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import Toast, { type ToastConfig, type ToastConfigParams } from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "./AppText";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";

type ToastType = "success" | "error" | "info";

interface ToastPillProps extends ToastConfigParams<any> {
  type: ToastType;
}

function ToastPill({ text1, text2, type, onPress, hide }: ToastPillProps) {
  const { colors, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const iconConfig = {
    success: {
      name: "checkmark-circle" as const,
      color: colors.primary,
      bg: colors.primary + "18",
    },
    error: {
      name: "alert-circle" as const,
      color: "#EF4444",
      bg: "#EF444418",
    },
    info: {
      name: "information-circle" as const,
      color: colors.primary,
      bg: colors.primary + "18",
    },
  }[type];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      hide();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View
        style={[
          styles.capsule,
          {
            borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)",
            backgroundColor: isDark ? colors.card + "E6" : colors.card + "F2",
          },
        ]}
      >
        {Platform.OS === "ios" && (
          <BlurView
            intensity={50}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Leading Icon Badge */}
        <View
          style={[
            styles.iconBadge,
            { backgroundColor: iconConfig.bg },
          ]}
        >
          <Ionicons
            name={iconConfig.name}
            size={rs.icon(20)}
            color={iconConfig.color}
          />
        </View>

        {/* Text Container */}
        <View style={styles.textContainer}>
          {!!text1 && (
            <AppText
              variant="body"
              family="title"
              color="text"
              numberOfLines={1}
            >
              {text1}
            </AppText>
          )}
          {!!text2 && (
            <AppText
              variant="caption"
              color="subtext"
              numberOfLines={2}
              style={styles.subtitle}
            >
              {text2}
            </AppText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export const toastConfig: ToastConfig = {
  success: (props) => <ToastPill {...props} type="success" />,
  error: (props) => <ToastPill {...props} type="error" />,
  info: (props) => <ToastPill {...props} type="info" />,
};

export function AppToast() {
  const insets = useSafeAreaInsets();
  // Ensure the floating pill clears floating tab bars, player, and safe margins
  const bottomOffset = Math.max(insets.bottom + 68, 80);

  return (
    <Toast
      config={toastConfig}
      position="bottom"
      bottomOffset={bottomOffset}
    />
  );
}

export default AppToast;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs.space(16),
  },
  capsule: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "92%",
    paddingVertical: rs.space(10),
    paddingHorizontal: rs.space(14),
    borderRadius: rs.space(26),
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: rs.space(14),
    elevation: 8,
    gap: rs.space(10),
  },
  iconBadge: {
    width: rs.space(32),
    height: rs.space(32),
    borderRadius: rs.space(16),
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flexShrink: 1,
    justifyContent: "center",
  },
  subtitle: {
    marginTop: rs.space(1),
  },
});
