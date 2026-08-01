import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { scale } from "react-native-size-matters";

interface AppStoreProgressControlProps {
  progress: number;
  onCancel: () => void;
  primaryColor: string;
  trackColor: string;
}

export const AppStoreProgressControl = React.memo(function AppStoreProgressControl({
  progress,
  onCancel,
  primaryColor,
  trackColor,
}: AppStoreProgressControlProps) {
  const size = scale(36);
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress || 0) * circumference;

  return (
    <Pressable
      onPressIn={onCancel}
      accessibilityRole="button"
      accessibilityLabel="Cancel Download"
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        {/* Background Track Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center Cross Icon */}
      <Ionicons name="close" size={scale(16)} color={primaryColor} />
    </Pressable>
  );
});

export default AppStoreProgressControl;
