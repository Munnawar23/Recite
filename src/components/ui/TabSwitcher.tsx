import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Pressable,
  View,
  type ViewStyle,
  type LayoutChangeEvent,
  Dimensions,
} from "react-native";
import { Haptics } from "@/lib/haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { rs } from "@/helpers/responsiveHelper";
import Animated, {
  Easing,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  useSharedValue,
  type WithSpringConfig,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { AppText } from "./AppText";

export interface TabOption {
  label: string;
  value: string;
}

interface TabSwitcherProps {
  tabs?: TabOption[];
  activeTab: string;
  onTabChange: (value: any) => void;
  containerStyle?: ViewStyle;
}

// Bouncy iOS-like physics
const SPRING_CONFIG: WithSpringConfig = {
  mass: 0.65,
  damping: 17,
  stiffness: 240,
  overshootClamping: false,
};

const SCALE_SPRING_CONFIG: WithSpringConfig = {
  mass: 0.55,
  damping: 14,
  stiffness: 260,
  overshootClamping: false,
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const TabSwitcher = React.memo(function TabSwitcher({
  tabs = [
    { label: "Read", value: "read" },
    { label: "Listen", value: "listen" },
  ],
  activeTab,
  onTabChange,
  containerStyle,
}: TabSwitcherProps) {
  const { colors, activeScheme, spacing } = useAppTheme();
  const isDark = activeScheme === "dark";

  // Pre-calculate estimated widths to prevent delay on mount
  const estimatedContainerWidth = SCREEN_WIDTH - spacing.screenPadding * 2;
  const estimatedTabWidth = (estimatedContainerWidth - rs.space(8)) / tabs.length;

  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(tabs.findIndex((t) => t.value === activeTab), 0);
  const tabWidth =
    containerWidth > 0 ? (containerWidth - rs.space(8)) / tabs.length : estimatedTabWidth;

  const translateX = useSharedValue(activeIndex * estimatedTabWidth);
  const pillScaleX = useSharedValue(1);
  const pillScaleY = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (tabWidth <= 0 || isDragging.value) return;

    const targetX = activeIndex * tabWidth;
    if (!isInitialized.current) {
      translateX.value = targetX;
      isInitialized.current = true;
      return;
    }

    // Dynamic pop & spring glide on tab switch
    pillScaleX.value = withSequence(
      withTiming(1.04, {
        duration: 140,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(1.0, SCALE_SPRING_CONFIG),
    );
    pillScaleY.value = withSequence(
      withTiming(1.32, {
        duration: 140,
        easing: Easing.out(Easing.quad),
      }),
      withSpring(1.0, SCALE_SPRING_CONFIG),
    );
    translateX.value = withSpring(targetX, SPRING_CONFIG);
  }, [activeIndex, tabWidth]);

  const handleTabChange = useCallback(
    (val: string) => {
      Haptics.light();
      onTabChange(val);
    },
    [onTabChange],
  );

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: pillScaleX.value },
      { scaleY: pillScaleY.value },
    ],
    width: tabWidth,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      "worklet";
      isDragging.value = true;
      startX.value = translateX.value;
      pillScaleX.value = withSpring(1.04, SCALE_SPRING_CONFIG);
      pillScaleY.value = withSpring(1.38, SCALE_SPRING_CONFIG);
      containerScale.value = withSpring(1.06, SCALE_SPRING_CONFIG);
    })
    .onUpdate((event) => {
      "worklet";
      isDragging.value = true;
      pillScaleX.value = 1.04;
      pillScaleY.value = 1.38;
      containerScale.value = 1.06;
      if (tabWidth <= 0) return;
      const maxTranslate = tabWidth * (tabs.length - 1);
      const rawX = startX.value + event.translationX;
      if (rawX < 0) {
        translateX.value = rawX * 0.45;
      } else if (rawX > maxTranslate) {
        translateX.value = maxTranslate + (rawX - maxTranslate) * 0.45;
      } else {
        translateX.value = rawX;
      }
    })
    .onFinalize(() => {
      "worklet";
      isDragging.value = false;
      pillScaleX.value = withSpring(1.0, SCALE_SPRING_CONFIG);
      pillScaleY.value = withSpring(1.0, SCALE_SPRING_CONFIG);
      containerScale.value = withSpring(1.0, SCALE_SPRING_CONFIG);
      if (tabWidth <= 0) return;
      const closestIndex = Math.round(translateX.value / tabWidth);
      const boundedIndex = Math.max(0, Math.min(closestIndex, tabs.length - 1));
      translateX.value = withSpring(boundedIndex * tabWidth, SPRING_CONFIG);
      const selectedTab = tabs[boundedIndex];
      if (selectedTab && selectedTab.value !== activeTab) {
        scheduleOnRN(handleTabChange, selectedTab.value);
      }
    });

  const onLayoutContainer = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const trackBg = isDark ? "rgba(255,255,255,0.06)" : colors.border + "70";
  const pillBg = isDark ? "rgba(255,255,255,0.15)" : colors.card;
  const activeTxtColor = colors.primary;
  const inactiveTxtColor = colors.subtext;

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingHorizontal: spacing.screenPadding },
        containerStyle,
        animatedContainerStyle,
      ]}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: trackBg,
            borderColor: colors.border,
          },
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <View
            style={styles.tabContainer}
            onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {tabWidth > 0 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.activePill,
                  { backgroundColor: pillBg },
                  animatedPillStyle,
                ]}
              />
            )}

            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  style={styles.tab}
                  hitSlop={rs.space(4)}
                  onPressIn={() => {
                    containerScale.value = withSpring(1.06, SCALE_SPRING_CONFIG);
                    pillScaleX.value = withSpring(1.04, SCALE_SPRING_CONFIG);
                    pillScaleY.value = withSpring(1.38, SCALE_SPRING_CONFIG);
                  }}
                  onPressOut={() => {
                    if (isDragging.value) return;
                    containerScale.value = withSpring(1.0, SCALE_SPRING_CONFIG);
                    pillScaleX.value = withSpring(1.0, SCALE_SPRING_CONFIG);
                    pillScaleY.value = withSpring(1.0, SCALE_SPRING_CONFIG);
                  }}
                  onPress={() => {
                    if (!isActive) {
                      handleTabChange(tab.value);
                    }
                  }}
                >
                  <AppText
                    variant="body"
                    family={isActive ? "title" : "text"}
                    color={isActive ? activeTxtColor : inactiveTxtColor}
                  >
                    {tab.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
});

export default TabSwitcher;

const styles = StyleSheet.create({
  container: {
    paddingVertical: rs.space(4),
    overflow: "visible",
  },
  track: {
    borderRadius: rs.space(14),
    overflow: "visible",
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: "row",
    padding: rs.space(4),
    position: "relative",
    overflow: "visible",
  },
  activePill: {
    position: "absolute",
    top: rs.space(4),
    bottom: rs.space(4),
    left: rs.space(4),
    borderRadius: rs.space(10),
    zIndex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: rs.space(10),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
