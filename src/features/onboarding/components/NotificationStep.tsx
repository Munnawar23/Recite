import { AppText, MessageModal } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { NotificationService } from "@/services/notificationService";
import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface NotificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const BENEFITS = ["onboarding.notifications.benefit1", "onboarding.notifications.benefit3"] as const;

export function NotificationStep({ onNext, onBack }: NotificationStepProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { isDailyReminderEnabled, toggleDailyReminder } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleEnable = async () => {
    if (isDailyReminderEnabled) {
      onNext();
      return;
    }
    setIsLoading(true);
    const result = await toggleDailyReminder();
    setIsLoading(false);

    if (result === 'blocked') {
      setShowBlockedModal(true);
      return;
    }

    onNext();
  };

  const S = createStyles(colors, spacing);

  return (
    <>
      <OnboardingStepWrapper
        step={4}
        title={t("onboarding.notifications.title", "Stay Connected")}
        subtitle={t(
          "onboarding.notifications.subtitle",
          "Enable daily reminders to keep you consistent with your Quran journey.",
        )}
        icon="notifications-outline"
        primaryLabel={
          isDailyReminderEnabled
            ? t("onboarding.notifications.enabledStatus", "Notifications Enabled")
            : t("onboarding.notifications.enableButton", "Enable Notifications")
        }
        onPrimary={handleEnable}
        onBack={onBack}
        primaryLoading={isLoading}
      >
        {/* Benefits list */}
        <FlatList
          data={BENEFITS}
          keyExtractor={(item) => item}
          style={S.benefitsList}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={S.itemSeparator} />}
          renderItem={({ item: key }) => (
            <View style={S.benefitRow}>
              <View style={S.checkCircle}>
                <Ionicons
                  name="checkmark"
                  size={rs.icon(14)}
                  color={colors.primary}
                />
              </View>
              <AppText variant="bodyLg" color="text" style={S.benefitText}>
                {t(key)}
              </AppText>
            </View>
          )}
        />

        {/* Skip hint */}
        <AppText variant="bodyLg" color="subtext" align="center" style={S.hintText}>
          {t(
            "onboarding.notifications.skipHint",
            "You can always enable this later in Settings",
          )}
        </AppText>
      </OnboardingStepWrapper>

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

const createStyles = (
  colors: any,
  spacing: any,
) =>
  StyleSheet.create({
    benefitsList: {
      flexGrow: 0,
      backgroundColor: colors.card,
      borderRadius: rs.space(16),
      padding: rs.space(18),
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: rs.space(16),
    },
    itemSeparator: {
      height: rs.space(8),
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(14),
    },
    checkCircle: {
      width: rs.space(26),
      height: rs.space(26),
      borderRadius: rs.space(13),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    benefitText: {
      flex: 1,
    },
    hintText: {
      marginTop: rs.space(6),
    },
  });

export default NotificationStep;
