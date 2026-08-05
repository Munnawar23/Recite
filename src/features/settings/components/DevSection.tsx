import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import MessageModal from "@/components/ui/MessageModal";
import { useAppTheme } from "@/hooks/useAppTheme";
import { NotificationService } from "@/services/NotificationService";
import Toast from "react-native-toast-message";

export default function DevSection() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [isSending, setIsSending] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleSendTestNotification = async () => {
    setIsSending(true);
    const success = await NotificationService.sendTestNotification();
    setIsSending(false);

    if (success) {
      Toast.show({
        type: "success",
        text1: "Notification Sent",
        text2: "Instant test notification delivered!",
      });
    } else {
      setShowBlockedModal(true);
    }
  };

  return (
    <>
      <SectionTitle label="Developer Tools" icon="code-working-outline" tightSpacing />

      <SettingsItemCard
        icon="notifications-circle-outline"
        title="Test Instant Notification"
        subtitle="Deliver a test notification immediately to verify permissions and layout"
        onPress={handleSendTestNotification}
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
