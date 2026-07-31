import { useAppTheme } from "@/hooks/useAppTheme";
import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface NotificationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const BENEFITS = [
  "onboarding.notifications.benefit1",
] as const;

export function NotificationStep({ onNext, onBack }: NotificationStepProps) {
  const { t } = useTranslation();
  const { isNightlyEnabled, toggleNightlyNotification } =
    useNotificationStore();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const [loading, setLoading] = useState(false);

  const handleEnable = async () => {
    if (isNightlyEnabled) {
      onNext();
      return;
    }
    setLoading(true);
    // Enable nightly reminder — this requests notification permission
    await toggleNightlyNotification(true);
    setLoading(false);
    onNext();
  };

  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <OnboardingStepWrapper
      step={3}
      title={t("onboarding.notifications.title", "Stay Connected")}
      subtitle={t(
        "onboarding.notifications.subtitle",
        "Enable daily reminders to keep you consistent with your Quran journey.",
      )}
      icon="notifications-outline"
      primaryLabel={
        isNightlyEnabled
          ? t("onboarding.notifications.enabledStatus", "Notifications Enabled")
          : t("onboarding.notifications.enableButton", "Enable Notifications")
      }
      onPrimary={handleEnable}
      onBack={onBack}
      primaryLoading={loading}
      showSkip={false}
    >
      {/* Benefits list */}
      <View style={S.benefitsList}>
        {BENEFITS.map((key) => (
          <View key={key} style={S.benefitRow}>
            <View style={S.checkCircle}>
              <Ionicons
                name="checkmark"
                size={scale(14)}
                color={colors.primary}
              />
            </View>
            <Text style={S.benefitText}>{t(key)}</Text>
          </View>
        ))}
      </View>

      {/* Success state */}
      {isNightlyEnabled && (
        <View style={S.successBadge}>
          <Ionicons
            name="checkmark-circle"
            size={scale(18)}
            color={colors.primary}
          />
          <Text style={S.successText}>
            {t("onboarding.notifications.enabledStatus", "Notifications Enabled")}
          </Text>
        </View>
      )}

      {/* Skip hint */}
      <Text style={S.hintText}>
        {t(
          "onboarding.notifications.skipHint",
          "You can always enable this later in Settings",
        )}
      </Text>
    </OnboardingStepWrapper>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, spacing: any) =>
  StyleSheet.create({
    benefitsList: {
      backgroundColor: colors.card,
      borderRadius: scale(16),
      padding: scale(16),
      borderWidth: 1,
      borderColor: colors.border,
      gap: verticalScale(12),
      marginBottom: verticalScale(12),
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
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
