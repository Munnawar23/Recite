import { useAppTheme } from "@/hooks/useAppTheme";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationService } from "@/services/notificationService";
import { MessageModal } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface NotificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const BENEFITS = ["onboarding.notifications.benefit1", "onboarding.notifications.benefit3"] as const;

export function NotificationStep({ onNext, onBack }: NotificationStepProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
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
      // Don't advance — let user fix the permission first
      return;
    }

    // 'enabled' or 'denied' — move forward either way
    onNext();
  };

  const S = createStyles(colors, fontFamily, fontSize, spacing);

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
                  size={scale(14)}
                  color={colors.primary}
                />
              </View>
              <Text style={S.benefitText}>{t(key)}</Text>
            </View>
          )}
        />

        {/* Skip hint */}
        <Text style={S.hintText}>
          {t(
            "onboarding.notifications.skipHint",
            "You can always enable this later in Settings",
          )}
        </Text>
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
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    benefitsList: {
      flexGrow: 0,
      backgroundColor: colors.card,
      borderRadius: scale(16),
      padding: scale(18),
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: verticalScale(16),
    },
    itemSeparator: {
      height: verticalScale(8),
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(14),
    },
    checkCircle: {
      width: scale(26),
      height: scale(26),
      borderRadius: scale(13),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    benefitText: {
      flex: 1,
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
      color: colors.text,
    },
    successBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
      backgroundColor: colors.primary + "18",
      borderRadius: scale(10),
      paddingVertical: verticalScale(8),
      paddingHorizontal: scale(14),
      marginBottom: verticalScale(8),
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    successText: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
      color: colors.primary,
    },
    hintText: {
      textAlign: "center",
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
      color: colors.subtext,
      marginTop: verticalScale(6),
    },
  });

export default NotificationStep;
