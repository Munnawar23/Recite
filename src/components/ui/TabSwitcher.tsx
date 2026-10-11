import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { Haptics } from "@/lib/haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { rs } from "@/helpers/responsiveHelper";
import { type ThemeColors, type ThemeSpacing } from "@/theme";
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

  const styles = useMemo(
    () => createStyles(colors, spacing, isDark),
    [colors, spacing, isDark],
  );

  const handleTabPress = useCallback(
    (val: string) => {
      Haptics.light();
      onTabChange(val);
    },
    [onTabChange],
  );

  return (
    <View style={containerStyle ? [styles.container, containerStyle] : styles.container}>
      <View style={styles.track}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Pressable
              key={tab.value}
              style={[styles.tab, isActive && styles.activeTab]}
              hitSlop={rs.space(4)}
              onPress={() => {
                if (!isActive) {
                  handleTabPress(tab.value);
                }
              }}
            >
              <AppText
                variant="body"
                family={isActive ? "title" : "text"}
                color={isActive ? "primary" : "subtext"}
              >
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

export default TabSwitcher;

const createStyles = (
  colors: ThemeColors,
  spacing: ThemeSpacing,
  isDark: boolean,
) => {
  const trackBg = isDark ? "rgba(255,255,255,0.06)" : colors.border + "70";
  const pillBg = isDark ? "rgba(255,255,255,0.15)" : colors.card;

  return StyleSheet.create({
    container: {
      paddingVertical: rs.space(4),
      paddingHorizontal: spacing.screenPadding,
    },
    track: {
      flexDirection: "row",
      padding: rs.space(4),
      borderRadius: rs.space(14),
      borderWidth: 1,
      backgroundColor: trackBg,
      borderColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: rs.space(10),
      alignItems: "center",
      justifyContent: "center",
      borderRadius: rs.space(10),
    },
    activeTab: {
      backgroundColor: pillBg,
    },
  });
};
