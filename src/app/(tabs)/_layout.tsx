import Background from "@/components/layout/Background";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "@/helpers/responsiveHelper";

interface TabIconProps {
  filled: keyof typeof Ionicons.glyphMap;
  outline: keyof typeof Ionicons.glyphMap;
  color: string | any;
  focused: boolean;
  size: number;
}

const TabIcon = React.memo(function TabIcon({
  filled,
  outline,
  color,
  focused,
  size,
}: TabIconProps) {
  return (
    <Ionicons
      name={focused ? filled : outline}
      size={size}
      color={color}
    />
  );
});

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors, fontFamily } = useAppTheme();
  const { bottom: bottomInset } = useAppSafeAreaInsets();

  const iconSize = scale(21);

  // Use safe area if available, otherwise give a comfortable padding
  const bottomPadding =
    bottomInset > 0
      ? bottomInset
      : Platform.OS === "ios"
        ? verticalScale(12)
        : verticalScale(10);

  const tabBarHeight = verticalScale(57) + bottomPadding;

  const tabListeners = useMemo(
    () => ({
      tabPress: () => {
        Haptics.medium();
      },
    }),
    [],
  );

  const renderTabIcon = useCallback(
    (
      filled: keyof typeof Ionicons.glyphMap,
      outline: keyof typeof Ionicons.glyphMap,
    ) =>
      ({ color, focused }: { color: string | any; focused: boolean }) => (
        <TabIcon
          filled={filled}
          outline={outline}
          color={color}
          focused={focused}
          size={iconSize}
        />
      ),
    [iconSize],
  );

  const screenOptions = useMemo(
    () => ({
      headerShown: false,

      sceneStyle: {
        backgroundColor: "transparent",
      },

      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.subtext,

      tabBarStyle: {
        backgroundColor: colors.card,
        borderTopColor: colors.border,

        height: tabBarHeight,

        paddingTop: verticalScale(3),
        paddingBottom: bottomPadding,

        elevation: 8,

        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },

      tabBarLabelStyle: {
        fontFamily: fontFamily.text,
        fontSize: moderateScale(12),
      },
    }),
    [colors, fontFamily, bottomPadding, tabBarHeight],
  );

  const tabs = useMemo(
    () =>
      [
        {
          name: "home",
          title: t("tabs.home", "Home"),
          label: t("tabs.home", "Home"),
          filled: "home" as const,
          outline: "home-outline" as const,
        },
        {
          name: "quran",
          title: t("tabs.quran", "Noble Quran"),
          label: t("common.quran", "Quran"),
          filled: "book" as const,
          outline: "book-outline" as const,
        },
        {
          name: "qibla",
          title: t("tabs.qibla", "Qibla"),
          label: t("common.qibla", "Qibla"),
          filled: "compass" as const,
          outline: "compass-outline" as const,
        },
        {
          name: "library",
          title: t("tabs.library", "Library"),
          label: t("common.library", "Library"),
          filled: "heart" as const,
          outline: "heart-outline" as const,
        },
        {
          name: "settings",
          title: t("tabs.settings", "Settings"),
          label: t("common.settings", "Settings"),
          filled: "settings" as const,
          outline: "settings-outline" as const,
        },
      ] as const,
    [t],
  );

  return (
    <View style={styles.container}>
      <Background />
      <Tabs screenOptions={screenOptions}>
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarLabel: tab.label,
              tabBarIcon: renderTabIcon(tab.filled, tab.outline),
            }}
            listeners={tabListeners}
          />
        ))}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
