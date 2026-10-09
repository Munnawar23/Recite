import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch, ActivityIndicator } from "react-native";
import { SectionTitle, MessageModal } from "@/components";
import SettingsItemCard from "./SettingsItemCard";
import { useNotificationStore } from "@/store/notificationStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { NotificationService } from "@/services/notificationService";
import { Haptics } from "@/lib/haptics";
import Toast from "react-native-toast-message";

export default function NotificationSection() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const { isDailyReminderEnabled, toggleDailyReminder } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleToggle = async () => {
    Haptics.light();
    setIsLoading(true);
    const result = await toggleDailyReminder();
    setIsLoading(false);

    if (result === "enabled") {
      Toast.show({
        type: "success",
        text1: t("settings.notifications.toastEnabledTitle", "Notifications Enabled"),
        text2: t("settings.notifications.toastEnabledDesc", "Daily reminder enabled for 11:00 PM."),
      });
    } else if (result === "disabled") {
      Toast.show({
        type: "info",
        text1: t("settings.notifications.toastDisabledTitle", "Notifications Disabled"),
        text2: t("settings.notifications.toastDisabledDesc", "Daily reminder disabled."),
      });
    } else if (result === "blocked") {
      setShowBlockedModal(true);
    }
  };

  return (
    <>
      <SectionTitle label={t("settings.sections.notifications", "Notifications")} icon="notifications-outline" tightSpacing />

      <SettingsItemCard
        icon="alarm-outline"
        title={t("settings.notifications.dailyReminderTitle", "Daily Reminder")}
        subtitle={t("settings.notifications.dailyReminderSubtitle", "Daily reminder at 11:00 PM")}
        rightElement={
          isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={isDailyReminderEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#FFFFFF"}
            />
          )
        }
      />

      <MessageModal
        visible={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        title={t("settings.notifications.blockedTitle", "Notifications Blocked")}
        message={t(
          "settings.notifications.blockedMessage",
          "Notifications disabled. Enable in Settings.",
        )}
        icon="notifications-off-outline"
        iconColor="#EF4444"
        secondaryButtonText={t("common.cancel", "Cancel")}
        onSecondaryPress={() => setShowBlockedModal(false)}
        primaryButtonText={t("settings.notifications.openSettings", "Open Settings")}
        onPrimaryPress={() => {
          setShowBlockedModal(false);
          void NotificationService.openAppSettings();
        }}
      />
    </>
  );
}
