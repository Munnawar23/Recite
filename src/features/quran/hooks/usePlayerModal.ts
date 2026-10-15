import { useCallback, useEffect } from "react";
import { BackHandler, Dimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface UsePlayerModalParams {
  visible: boolean;
  onClose?: () => void;
}

export function usePlayerModal({ visible, onClose }: UsePlayerModalParams) {
  const translateY = useSharedValue(SCREEN_HEIGHT);

  // Smooth slide-down exit animation
  const closePlayer = useCallback(() => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 240 }, () => {
      if (onClose) {
        scheduleOnRN(onClose);
      }
    });
  }, [onClose, translateY]);

  // Enter & exit animation based on visibility
  useEffect(() => {
    if (visible) {
      translateY.value = SCREEN_HEIGHT;
      translateY.value = withSpring(0, {
        damping: 24,
        stiffness: 200,
        mass: 0.8,
      });
    } else {
      translateY.value = SCREEN_HEIGHT;
    }
  }, [visible, translateY]);

  // Android hardware back button handler
  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      closePlayer();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => backHandler.remove();
  }, [visible, closePlayer]);

  // Drag-to-dismiss pan gesture
  const panGesture = Gesture.Pan()
    .activeOffsetY([10, 1000])
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 140 || event.velocityY > 500) {
        scheduleOnRN(closePlayer);
      } else {
        translateY.value = withSpring(0, {
          damping: 24,
          stiffness: 200,
          mass: 0.8,
        });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT * 0.7],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return {
    closePlayer,
    panGesture,
    animatedSheetStyle,
    animatedBackdropStyle,
  };
}
