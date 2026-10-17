import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ThemeColors } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLAYER_HIDE_OFFSET } from "../hooks/useQuranDetailScroll";

const PLAYER_BUTTON_OFFSET = 100;

interface ScrollTopButtonProps {
  showScrollTop: boolean;
  animatedScrollTopStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>> | any;
  hasAudioPlayer: boolean;
  playerScrollTranslateY?: SharedValue<number>;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function ScrollTopButton({
  showScrollTop,
  animatedScrollTopStyle,
  hasAudioPlayer,
  playerScrollTranslateY,
  onPress,
  style,
}: ScrollTopButtonProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const S = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );

  // Smoothly close the dead space when the audio player slides off-screen
  const playerShift = useMemo(() => {
    const playerBottomOffset = Math.max(
      insets.bottom + rs.space(8),
      rs.space(22),
    );
    const withAudioBottom = playerBottomOffset + rs.space(PLAYER_BUTTON_OFFSET);
    const withoutAudioBottom = Math.max(
      insets.bottom + rs.space(12),
      rs.space(20),
    );
    return withAudioBottom - withoutAudioBottom;
  }, [insets.bottom]);

  const animatedPlayerShiftStyle = useAnimatedStyle(() => {
    if (!hasAudioPlayer || !playerScrollTranslateY) {
      return { transform: [{ translateY: 0 }] };
    }
    const progress = Math.min(
      1,
      Math.max(0, playerScrollTranslateY.value / PLAYER_HIDE_OFFSET),
    );
    return {
      transform: [{ translateY: progress * playerShift }],
    };
  });

  return (
    <Animated.View
      style={[
        S.container,
        hasAudioPlayer ? S.withAudioPlayer : S.withoutAudioPlayer,
        animatedPlayerShiftStyle,
        style,
      ]}
      pointerEvents={showScrollTop ? "auto" : "none"}
    >
      <Animated.View style={animatedScrollTopStyle}>
        <TouchableOpacity
          style={S.button}
          activeOpacity={0.8}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Scroll to top"
        >
          <Ionicons name="chevron-up" size={rs.icon(24)} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, bottomInset: number) => {
  const playerBottomOffset = Math.max(bottomInset + rs.space(8), rs.space(27));

  return StyleSheet.create({
    container: {
      position: "absolute",
      right: rs.space(16),
      zIndex: 25,
    },
    withAudioPlayer: {
      bottom: playerBottomOffset + rs.space(PLAYER_BUTTON_OFFSET),
    },
    withoutAudioPlayer: {
      bottom: Math.max(bottomInset + rs.space(12), rs.space(20)),
    },
    button: {
      width: rs.space(44),
      height: rs.space(44),
      borderRadius: rs.space(22),
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
