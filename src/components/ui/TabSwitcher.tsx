import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle, LayoutChangeEvent } from "react-native";
import { Haptics } from "@/lib/haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import { BlurView } from "expo-blur";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  runOnJS,
  type WithSpringConfig
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
  const S = createStyles(colors, fontFamily, fontSize, spacing, isDark);
  
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndex = Math.max(tabs.findIndex(t => t.value === activeTab), 0);
  // Account for padding (scale(4) on left and right = scale(8) total)
  const tabWidth = containerWidth > 0 ? (containerWidth - scale(8)) / tabs.length : 0;

  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scaleAnim = useSharedValue(1);

  const SPRING_CONFIG: WithSpringConfig = {
    mass: 1,
    damping: 20, // Lower is bouncier
    stiffness: 250, // Higher is faster
    overshootClamping: false,
  };

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(activeIndex * tabWidth, SPRING_CONFIG);
    }
  }, [activeIndex, tabWidth]);

  const handleTabChange = (val: string) => {
    Haptics.heavy();
    onTabChange(val);
  };

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scaleAnim.value }
      ],
      width: tabWidth,
    };
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      scaleAnim.value = withSpring(1.05, { mass: 1, damping: 15, stiffness: 300 }); // Quick zoom
    })
    .onChange((event) => {
      if (tabWidth > 0) {
        const maxTranslate = tabWidth * (tabs.length - 1);
        let newValue = translateX.value + event.changeX;
        
        // Clamp the pill so it doesn't drag outside the container
        if (newValue < 0) newValue = 0;
        if (newValue > maxTranslate) newValue = maxTranslate;
        
        translateX.value = newValue;
      }
    })
    .onFinalize(() => {
      isDragging.value = false;
      scaleAnim.value = withSpring(1, SPRING_CONFIG); // Bounce back to normal
      
      if (tabWidth > 0) {
        // Calculate the closest tab index based on where the user dropped it
        const closestIndex = Math.round(translateX.value / tabWidth);
        const targetX = closestIndex * tabWidth;
        
        // Snap the pill into place using spring physics
        translateX.value = withSpring(targetX, SPRING_CONFIG);

        // Trigger the tab change logic safely on the JS thread
        const newTab = tabs[closestIndex];
        if (newTab && newTab.value !== activeTab) {
          runOnJS(handleTabChange)(newTab.value);
        }
      }
    });

  return (
    <View style={[S.container, containerStyle]}>
      <View style={S.blurWrapper}>
        <BlurView 
          intensity={isDark ? 30 : 60} 
          tint={isDark ? "dark" : "light"} 
          style={StyleSheet.absoluteFill} 
        />
        
        <GestureDetector gesture={pan}>
          <View 
            style={S.tabContainer}
            onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {/* Animated Pill Background */}
            {containerWidth > 0 && (
              <Animated.View style={[S.activePill, animatedPillStyle]} />
            )}

            {/* Tab Buttons */}
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <TouchableOpacity
                  key={tab.value}
                  style={S.tab}
                  activeOpacity={1}
                  onPress={() => {
                    if (!isActive) {
                      Haptics.heavy();
                      onTabChange(tab.value);
                    }
                  }}
                >
                  <Text style={[S.tabText, isActive && S.activeTabText]}>
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

const createStyles = (colors: any, fontFamily: any, fontSize: any, spacing: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: verticalScale(2),
    },
    blurWrapper: {
      borderRadius: scale(14),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
      backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.4)",
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
      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#FFFFFF",
      borderRadius: scale(10),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.08,
      shadowRadius: scale(4),
      elevation: isDark ? 0 : 2,
    },
    tab: {
      flex: 1,
      paddingVertical: verticalScale(10),
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    tabText: {
      fontSize: fontSize.body,
      fontFamily: fontFamily.text,
      color: colors.subtext,
    },
    activeTabText: {
      fontFamily: fontFamily.title,
      color: isDark ? colors.primary : colors.primary,
    },
  });
