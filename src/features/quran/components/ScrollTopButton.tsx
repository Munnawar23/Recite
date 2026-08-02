import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const S = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  return (
    <Animated.View
      style={[
        S.container,
        hasAudioPlayer ? S.withAudioPlayer : S.withoutAudioPlayer,
        animatedScrollTopStyle,
      ]}
      pointerEvents={showScrollTop ? "auto" : "none"}
    >
      <TouchableOpacity style={S.button} activeOpacity={0.8} onPress={onPress}>
        <Ionicons name="chevron-up" size={scale(24)} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: any, bottomInset: number) => {
  const playerBottomOffset = Math.max(bottomInset + verticalScale(8), verticalScale(22));

  return StyleSheet.create({
    container: {
      position: "absolute",
      right: scale(16),
      zIndex: 25,
    },
    withAudioPlayer: {
      bottom: playerBottomOffset + verticalScale(100),
    },
    withoutAudioPlayer: {
      bottom: Math.max(bottomInset + verticalScale(12), verticalScale(20)),
    },
    button: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 6,
    },
  });
};
