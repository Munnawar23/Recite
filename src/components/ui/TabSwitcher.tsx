import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle, LayoutChangeEvent, Dimensions } from "react-native";
import { Haptics } from "@/lib/haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
  type WithSpringConfig,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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
  const { colors, fontFamily, fontSize, activeScheme, spacing } = useAppTheme();
  const isDark = activeScheme === "dark";

  // Pre-calculate estimated widths to prevent 1-2s delay on mount
  const estimatedContainerWidth = SCREEN_WIDTH - spacing.screenPadding * 2;
  const estimatedTabWidth = (estimatedContainerWidth - scale(8)) / tabs.length;

  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(tabs.findIndex((t) => t.value === activeTab), 0);
  const tabWidth = containerWidth > 0 ? (containerWidth - scale(8)) / tabs.length : estimatedTabWidth;

  const translateX = useSharedValue(activeIndex * estimatedTabWidth);
  const scaleAnim = useSharedValue(1);
  const isInitialized = React.useRef(false);

  useEffect(() => {
    const targetX = activeIndex * tabWidth;
    if (!isInitialized.current) {
      // Direct assignment on first layout calculation to avoid spring delay on mount
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

  // All colors computed fresh on every render — no stale closure issue
  const trackBg = isDark ? "rgba(255,255,255,0.06)" : "#FAF4EC";
  const pillBg = isDark ? "rgba(255,255,255,0.15)" : "#FFFFFF";
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
            {/* Render active pill immediately to prevent flashing/delay */}
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
                  <Text
                    style={{
                      fontSize: fontSize.body,
                      fontFamily: isActive ? fontFamily.title : fontFamily.text,
                      color: isActive ? activeTxtColor : inactiveTxtColor,
                    }}
                  >
                    {tab.label}
                  </Text>
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
    paddingBottom: verticalScale(2),
  },
  track: {
    borderRadius: scale(14),
    overflow: "hidden",
    borderWidth: 1,
  },
  tabContainer: {
    flexDirection: "row",
    padding: scale(4),
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: scale(4),
    bottom: scale(4),
    left: scale(4),
    borderRadius: scale(10),
  },
  tab: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});


