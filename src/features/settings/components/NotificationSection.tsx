import React from "react";
import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNotificationStore } from "@/store/notificationStore";
import { Haptics } from "@/lib/haptics";

export default function NotificationSection() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const isNotificationsEnabled = useNotificationStore(
    (state) => state.isNotificationsEnabled,
  );
  const isLoading = useNotificationStore((state) => state.isLoading);
  const toggleNotifications = useNotificationStore(
    (state) => state.toggleNotifications,
  );

  const handleToggle = async (targetValue: boolean) => {
    if (isLoading) return;
    Haptics.medium();
    const success = await toggleNotifications(targetValue);
    if (success) {
      Toast.show({
        type: "success",
        text1: targetValue
          ? t("settings.notifications.toastEnabledTitle", "Notifications Enabled")
          : t("settings.notifications.toastDisabledTitle", "Notifications Disabled"),
        text2: targetValue
          ? t("settings.notifications.toastEnabledDesc", "Daily reminders have been enabled.")
          : t("settings.notifications.toastDisabledDesc", "Daily reminders have been disabled."),
      });
    }
  };

  return (
    <>
      <SectionTitle
        label={t("settings.sections.notifications", "Notifications")}
        icon="notifications-outline"
        tightSpacing
      />

      {/* Daily reminder toggle */}
      <SettingsItemCard
        icon="alarm-outline"
        title={t("settings.notifications.enableTitle", "Enable Notifications")}
        subtitle={
          isNotificationsEnabled
            ? t("settings.notifications.enabled", "Notification enabled")
            : t("settings.notifications.disabled", "Disabled")
        }
        onPress={() => {
          handleToggle(!isNotificationsEnabled);
        }}
        rightElement={
          <Switch
            value={isNotificationsEnabled}
            disabled={isLoading}
            onValueChange={(val) => {
              handleToggle(val);
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
