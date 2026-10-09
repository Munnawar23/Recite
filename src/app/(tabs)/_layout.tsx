import { Background } from "@/components";
import { FloatingTabBar } from "@/components/ui/FloatingTabBar";
import { Tabs } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  const { t } = useTranslation();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      sceneStyle: {
        backgroundColor: "transparent",
      },
      // Hide the native tab bar completely — we render our own
      tabBarStyle: { display: "none" as const },
    }),
    [],
  );

  const tabs = [
    {
      name: "home",
      title: t("tabs.home", "Home"),
      label: t("tabs.home", "Home"),
    },
    {
      name: "quran",
      title: t("tabs.quran", "Noble Quran"),
      label: t("common.quran", "Quran"),
    },
    {
      name: "qibla",
      title: t("tabs.qibla", "Qibla"),
      label: t("common.qibla", "Qibla"),
    },
    {
      name: "library",
      title: t("tabs.library", "Library"),
      label: t("common.library", "Library"),
    },
    {
      name: "settings",
      title: t("tabs.settings", "Settings"),
      label: t("common.settings", "Settings"),
    },
  ] as const;

  return (
    <View style={styles.container}>
      <Background />
      <Tabs
        screenOptions={screenOptions}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarLabel: tab.label,
            }}
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
