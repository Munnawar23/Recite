import { Background } from "@/components";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize } = useAppTheme();
  const { bottom: bottomInset } = useAppSafeAreaInsets();

  const iconSize = scale(20);

  // Use safe area if available, otherwise give a comfortable padding
  const bottomPadding =
    bottomInset > 0
      ? bottomInset
      : Platform.OS === "ios"
        ? verticalScale(12)
        : verticalScale(10);

  const tabBarHeight = verticalScale(50) + bottomPadding;

  const handleTabPress = () => {
    Haptics.medium();
  };

  const tabListeners = {
    tabPress: handleTabPress,
  };

  const renderTabIcon =
    (
      filled: keyof typeof Ionicons.glyphMap,
      outline: keyof typeof Ionicons.glyphMap,
    ) =>
    ({ color, focused }: { color: string | any; focused: boolean }) => (
      <Ionicons
        name={focused ? filled : outline}
        size={iconSize}
        color={color}
      />
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
        fontSize: fontSize.caption ?? moderateScale(11),
      },
    }),
    [colors, fontFamily, fontSize, bottomPadding, tabBarHeight],
  );

  const tabs = [
    {
      name: "home",
      title: t("tabs.home", "Home"),
      label: t("tabs.home", "Home"),
      filled: "home",
      outline: "home-outline",
    },
    {
      name: "quran",
      title: t("tabs.quran", "Noble Quran"),
      label: t("common.quran", "Quran"),
      filled: "book",
      outline: "book-outline",
    },
    {
      name: "qibla",
      title: t("tabs.qibla", "Qibla"),
      label: t("common.qibla", "Qibla"),
      filled: "compass",
      outline: "compass-outline",
    },
    {
      name: "library",
      title: t("tabs.library", "Library"),
      label: t("common.library", "Library"),
      filled: "bookmarks",
      outline: "bookmarks-outline",
    },
    {
      name: "settings",
      title: t("tabs.settings", "Settings"),
      label: t("common.settings", "Settings"),
      filled: "settings",
      outline: "settings-outline",
    },
  ] as const;

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
