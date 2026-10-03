import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
  LayoutChangeEvent,
  Dimensions,
} from "react-native";
import { Haptics } from "@/lib/haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { rs } from "@/helpers/responsiveHelper";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  type WithSpringConfig,
} from "react-native-reanimated";
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

const SPRING_CONFIG: WithSpringConfig = {
  mass: 1,
  damping: 20,
  stiffness: 250,
  overshootClamping: false,
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TabSwitcher: React.FC<TabSwitcherProps> = ({
  tabs = [
    { label: "Read", value: "read" },
    { label: "Listen", value: "listen" },
  ],
  activeTab,
  onTabChange,
  containerStyle,
}) => {
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
  const scaleAnim = useSharedValue(1);
  const isInitialized = React.useRef(false);

  useEffect(() => {
    const targetX = activeIndex * tabWidth;
    if (!isInitialized.current) {
      translateX.value = targetX;
      isInitialized.current = true;
    } else {
      translateX.value = withSpring(targetX, SPRING_CONFIG);
    }
  }, [activeIndex, tabWidth]);

  const handleTabChange = (val: string) => {
    Haptics.heavy();
    onTabChange(val);
  };

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scaleAnim.value },
    ],
    width: tabWidth,
  }));

  const pan = Gesture.Pan()
    .onBegin(() => {
      scaleAnim.value = withSpring(1.05, { mass: 1, damping: 15, stiffness: 300 });
    })
    .onChange((event) => {
      if (tabWidth > 0) {
        const maxTranslate = tabWidth * (tabs.length - 1);
        let newValue = translateX.value + event.changeX;
        if (newValue < 0) newValue = 0;
        if (newValue > maxTranslate) newValue = maxTranslate;
        translateX.value = newValue;
      }
    })
    .onFinalize(() => {
      scaleAnim.value = withSpring(1, SPRING_CONFIG);
      if (tabWidth > 0) {
        const closestIndex = Math.round(translateX.value / tabWidth);
        translateX.value = withSpring(closestIndex * tabWidth, SPRING_CONFIG);
        const newTab = tabs[closestIndex];
        if (newTab && newTab.value !== activeTab) {
          runOnJS(handleTabChange)(newTab.value);
        }
      }
    });

  const trackBg = isDark ? "rgba(255,255,255,0.06)" : colors.border + "70";
  const pillBg = isDark ? "rgba(255,255,255,0.15)" : colors.card;
  const activeTxtColor = colors.primary;
  const inactiveTxtColor = colors.subtext;

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.screenPadding }, containerStyle]}>
      <View
        style={[
          styles.track,
          {
            backgroundColor: trackBg,
            borderColor: colors.border,
          },
        ]}
      >
        <GestureDetector gesture={pan}>
          <View
            style={styles.tabContainer}
            onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[
                styles.activePill,
                { backgroundColor: pillBg },
                animatedPillStyle,
              ]}
            />

            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <TouchableOpacity
                  key={tab.value}
                  style={styles.tab}
                  activeOpacity={1}
                  onPress={() => {
                    if (!isActive) {
                      Haptics.heavy();
                      onTabChange(tab.value);
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
                </TouchableOpacity>
              );
            })}
          </View>
        </GestureDetector>
      </View>
    </View>
  );
};

export default TabSwitcher;

const styles = StyleSheet.create({
  container: {
    paddingBottom: rs.space(2),
  },
  track: {
    borderRadius: rs.space(14),
    overflow: "hidden",
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: "row",
    padding: rs.space(4),
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: rs.space(4),
    bottom: rs.space(4),
    left: rs.space(4),
    borderRadius: rs.space(10),
  },
  tab: {
    flex: 1,
    paddingVertical: rs.space(10),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
