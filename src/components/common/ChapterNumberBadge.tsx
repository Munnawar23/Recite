import React, { memo } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { AppText } from "../ui/AppText";
import { scale } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ChapterNumberBadgeProps {
  chapterNumber: number | string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

function ChapterNumberBadge({
  chapterNumber,
  size = scale(36),
  style,
}: ChapterNumberBadgeProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size },
        style,
      ]}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="M 18 3 L 22.02 8.30 L 28.61 7.39 L 27.70 13.98 L 33 18 L 27.70 22.02 L 28.61 28.61 L 22.02 27.70 L 18 33 L 13.98 27.70 L 7.39 28.61 L 8.30 22.02 L 3 18 L 8.30 13.98 L 7.39 7.39 L 13.98 8.30 Z"
          fill={colors.primary + "15"}
          stroke={colors.primary + "90"}
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
      <AppText
        variant="caption"
        family="title"
        fontWeight="700"
        color="primary"
      >
        {chapterNumber}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

export default memo(ChapterNumberBadge);
