import { useCallback, useEffect, useRef } from "react";
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
import { Haptics } from "@/lib/haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface UsePlayerModalParams {
  visible: boolean;
  onClose?: () => void;
}

export function usePlayerModal({ visible, onClose }: UsePlayerModalParams) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const trackTranslateX = useSharedValue(0);
  const trackOpacity = useSharedValue(1);
  const isTransitioningRef = useRef(false);
  const changeFnRef = useRef<(() => void) | null>(null);

  const resetTransition = useCallback(() => {
    isTransitioningRef.current = false;
  }, []);

  const onSlideOutComplete = useCallback(() => {
    if (changeFnRef.current) {
      changeFnRef.current();
      changeFnRef.current = null;
    }
    trackTranslateX.value = 36;
    trackTranslateX.value = withSpring(0, {
      damping: 20,
      stiffness: 180,
      mass: 0.8,
    });
    trackOpacity.value = withTiming(1, { duration: 220 });

    setTimeout(resetTransition, 250);
  }, [trackTranslateX, trackOpacity, resetTransition]);

  // Reset track animation when modal opens
  useEffect(() => {
    if (visible) {
      trackTranslateX.value = 0;
      trackOpacity.value = 1;
      isTransitioningRef.current = false;
    }
  }, [visible, trackTranslateX, trackOpacity]);

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

  const headerTitleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackTranslateX.value * 0.4 }],
    opacity: trackOpacity.value,
  }));

  const trackContentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: trackTranslateX.value }],
    opacity: trackOpacity.value,
  }));

  const animateTrackChange = useCallback((changeFn: () => void) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    Haptics.light();

    changeFnRef.current = changeFn;

    // 1. Slide current track slightly to the left and fade out
    trackTranslateX.value = withTiming(-36, { duration: 150 }, (finished) => {
      if (finished) {
        scheduleOnRN(onSlideOutComplete);
      } else {
        scheduleOnRN(resetTransition);
      }
    });
    trackOpacity.value = withTiming(0, { duration: 150 });
  }, [onSlideOutComplete, resetTransition, trackTranslateX, trackOpacity]);

  return {
    closePlayer,
    panGesture,
    animatedSheetStyle,
    animatedBackdropStyle,
    headerTitleAnimatedStyle,
    trackContentAnimatedStyle,
    animateTrackChange,
  };
}
