import React from "react";
import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNotificationStore } from "@/store/notificationStore";
import { Haptics } from "@/lib/haptics";

export default function NotificationSection() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { isNightlyEnabled, toggleNightlyNotification } = useNotificationStore();

  return (
    <>
      <SectionTitle label={t("settings.sections.notifications", "Notifications")} icon="notifications-outline" tightSpacing />
      <SettingsItemCard
        icon="alarm-outline"
        title={t("settings.notifications.enableTitle", "Enable Notifications")}
        subtitle={
          isNightlyEnabled
            ? t("settings.notifications.enabled", "Notification enabled")
            : t("settings.notifications.disabled", "Disabled")
        }
        onPress={() => {
          Haptics.medium();
          toggleNightlyNotification(!isNightlyEnabled);
        }}
        rightElement={
          <Switch
            value={isNightlyEnabled}
            onValueChange={(val) => {
              Haptics.medium();
              toggleNightlyNotification(val);
            }}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
          />
        }
      />
    </>
  );
}
