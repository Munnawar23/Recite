import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { scale, verticalScale } from "react-native-size-matters";

interface ScrollTopButtonProps {
  showScrollTop: boolean;
  animatedScrollTopStyle: any;
  hasAudioPlayer: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export default function ScrollTopButton({
  showScrollTop,
  animatedScrollTopStyle,
  hasAudioPlayer,
  onPress,
}: ScrollTopButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: hasAudioPlayer ? verticalScale(105) : verticalScale(10) },
        animatedScrollTopStyle,
      ]}
      pointerEvents={showScrollTop ? "auto" : "none"}
    >
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Ionicons name="chevron-up" size={scale(24)} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: scale(16),
    zIndex: 25,
  },
  button: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
});
