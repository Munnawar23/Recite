import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  type WithSpringConfig,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { Haptics } from "@/lib/haptics";
import { rs, verticalScale } from "@/helpers/responsiveHelper";
import { AppText } from "./AppText";

// ─── Self-contained Tab Bar Props (no external package dependency) ────────────
export interface FloatingTabBarProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
      params?: any;
    }>;
    [key: string]: any;
  };
  descriptors: Record<
    string,
    {
      options?: {
        title?: string;
        tabBarLabel?: string | ((props: any) => React.ReactNode);
        [key: string]: any;
      };
      [key: string]: any;
    }
  >;
  navigation: {
    emit: (event: any) => any;
    navigate: (...args: any[]) => void;
    [key: string]: any;
  };
  insets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  [key: string]: any;
}

// ─── Spring physics (identical to TabSwitcher) ───────────────────────────────
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

// ─── Tab icon map ─────────────────────────────────────────────────────────────
const TAB_ICONS: Record<
  string,
  { filled: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }
> = {
  home: { filled: "home", outline: "home-outline" },
  quran: { filled: "book", outline: "book-outline" },
  qibla: { filled: "compass", outline: "compass-outline" },
  library: { filled: "bookmarks", outline: "bookmarks-outline" },
  settings: { filled: "settings", outline: "settings-outline" },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_INSET = rs.space(20);
const HORIZONTAL_PADDING = rs.space(4);
const SHELL_BORDER_RADIUS = rs.space(28);
const PILL_BORDER_RADIUS = rs.space(22);
const ESTIMATED_ROW_WIDTH =
  SCREEN_WIDTH - HORIZONTAL_INSET * 2 - HORIZONTAL_PADDING * 2;

// ─── Component ────────────────────────────────────────────────────────────────
export const FloatingTabBar = React.memo(function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: FloatingTabBarProps) {
  const { colors, activeScheme, fontFamily } = useAppTheme();
  const isDark = activeScheme === "dark";
  const { bottom: bottomInset } = useAppSafeAreaInsets();

  const iconSize = rs.icon(20);

  // ── Layout ──────────────────────────────────────────────────────────────────
  const tabCount = state.routes.length;
  const estimatedTabWidth = ESTIMATED_ROW_WIDTH / (tabCount || 5);
  const [containerWidth, setContainerWidth] = useState(ESTIMATED_ROW_WIDTH);
  const tabWidth =
    containerWidth > 0 ? containerWidth / tabCount : estimatedTabWidth;

  // ── Shared values ───────────────────────────────────────────────────────────
  const translateX = useSharedValue(state.index * estimatedTabWidth);
  const pillScaleX = useSharedValue(1);
  const pillScaleY = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const startX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isInitialized = useRef(false);

  // Snap/animate pill when active tab changes
  const activeIndex = state.index;
  React.useEffect(() => {
    if (tabWidth <= 0 || isDragging.value) return;

    const targetX = activeIndex * tabWidth;
    if (!isInitialized.current) {
      translateX.value = targetX;
      isInitialized.current = true;
      return;
    }

    pillScaleX.value = withSequence(
      withTiming(1.04, { duration: 140, easing: Easing.out(Easing.quad) }),
      withSpring(1.0, SCALE_SPRING_CONFIG),
    );
    pillScaleY.value = withSequence(
      withTiming(1.32, { duration: 140, easing: Easing.out(Easing.quad) }),
      withSpring(1.0, SCALE_SPRING_CONFIG),
    );
    translateX.value = withSpring(targetX, SPRING_CONFIG);
  }, [activeIndex, tabWidth]);

  // ── Navigation helper (called from worklet via scheduleOnRN) ─────────────
  const navigateToIndex = useCallback(
    (index: number) => {
      const route = state.routes[index];
      if (!route) return;
      Haptics.light();
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!event?.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, state.routes],
  );

  // ── Pan gesture ──────────────────────────────────────────────────────────
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
      const maxTranslate = tabWidth * (tabCount - 1);
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
      const boundedIndex = Math.max(0, Math.min(closestIndex, tabCount - 1));
      translateX.value = withSpring(boundedIndex * tabWidth, SPRING_CONFIG);
      if (boundedIndex !== activeIndex) {
        scheduleOnRN(navigateToIndex, boundedIndex);
      }
    });

  // ── Animated styles ──────────────────────────────────────────────────────
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

  // ── Colors ───────────────────────────────────────────────────────────────
  const pillBg = isDark ? "rgba(255, 255, 255, 0.22)" : colors.card;
  const pillBorder = isDark
    ? "rgba(255, 255, 255, 0.22)"
    : "rgba(0, 0, 0, 0.06)";
  const activeTxt = colors.primary;
  const inactiveTxt = colors.subtext;

  // ── Bottom position ──────────────────────────────────────────────────────
  const barBottom =
    bottomInset >= 40
      ? bottomInset + verticalScale(8)
      : bottomInset > 0
        ? bottomInset + verticalScale(4)
        : verticalScale(16);

  // ── Tab row content ──────────────────────────────────────────────────────
  const tabRowContent = (
    <GestureDetector gesture={panGesture}>
      <View
        style={styles.tabRow}
        onLayout={(e: LayoutChangeEvent) =>
          setContainerWidth(e.nativeEvent.layout.width)
        }
      >
        {/* Sliding glass pill */}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activePill,
              {
                backgroundColor: pillBg,
                borderColor: pillBorder,
              },
              animatedPillStyle,
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const isActive = index === activeIndex;
          const options = descriptors[route.key]?.options;
          const rawLabel = options?.tabBarLabel ?? options?.title ?? route.name;
          const label = typeof rawLabel === "string" ? rawLabel : route.name;
          const icons = TAB_ICONS[route.name] ?? {
            filled: "ellipse",
            outline: "ellipse-outline",
          };

          return (
            <Pressable
              key={route.key}
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
                  navigateToIndex(index);
                }
              }}
            >
              <Ionicons
                name={isActive ? icons.filled : icons.outline}
                size={iconSize}
                color={isActive ? activeTxt : inactiveTxt}
              />
              <AppText
                variant="caption"
                color={isActive ? activeTxt : inactiveTxt}
                style={{
                  fontFamily: isActive ? fontFamily.title : fontFamily.text,
                  fontSize: rs.font(11),
                  marginTop: verticalScale(2),
                  textAlign: "center",
                }}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </GestureDetector>
  );

  const tint = isDark ? "rgba(18, 24, 25, 0.78)" : "rgba(232, 230, 225, 0.84)";
  const edge = isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.08)";

  return (
    <Animated.View
      style={[
        styles.outerWrapper,
        { bottom: barBottom },
        animatedContainerStyle,
      ]}
    >
      {/* 1. Shadow shell: rounded, NOT clipped */}
      <View style={[styles.shadowShell, { backgroundColor: tint }]}>
        {/* 2. Blur layer: rounded AND clipped */}
        <View style={styles.blurClip} pointerEvents="none">
          <BlurView
            intensity={Platform.OS === "ios" ? 90 : 55}
            tint={
              Platform.OS === "ios"
                ? isDark
                  ? "systemThinMaterialDark"
                  : "systemThinMaterialLight"
                : isDark
                  ? "dark"
                  : "light"
            }
            blurMethod="none"
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.edge,
              { borderColor: edge },
            ]}
          />
        </View>

        {/* 3. Content: overflow visible so the pill can overshoot */}
        <View style={styles.content}>{tabRowContent}</View>
      </View>
    </Animated.View>
  );
});

export default FloatingTabBar;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    position: "absolute",
    left: HORIZONTAL_INSET,
    right: HORIZONTAL_INSET,
    overflow: "visible",
  },
  shadowShell: {
    borderRadius: SHELL_BORDER_RADIUS,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(6) },
    shadowOpacity: 0.14,
    shadowRadius: rs.space(16),
    elevation: 0,
  },
  blurClip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: SHELL_BORDER_RADIUS,
    overflow: "hidden", // this is what rounds the blur
  },
  edge: {
    borderRadius: SHELL_BORDER_RADIUS,
    borderWidth: 1,
  },
  content: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: HORIZONTAL_PADDING,
    overflow: "visible",
  },
  tabRow: {
    flexDirection: "row",
    position: "relative",
    overflow: "visible",
  },
  activePill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: PILL_BORDER_RADIUS,
    borderWidth: 1,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.08,
    shadowRadius: rs.space(4),
    elevation: 1,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(5),
    zIndex: 10,
  },
});
