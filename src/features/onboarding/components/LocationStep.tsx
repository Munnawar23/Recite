import { AppText, MessageModal } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocation } from "@/hooks/useLocation";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface LocationStepProps {
  onFinish: () => void;
  onBack: () => void;
}

const BENEFITS = [
  "onboarding.location.benefit1",
  "onboarding.location.benefit2",
] as const;

export function LocationStep({ onFinish, onBack }: LocationStepProps) {
  const { t } = useTranslation();
  const { permissionStatus, requestLocation, openAppSettings, isLoading } = useLocation();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const isGranted = permissionStatus === "granted";

  const handleEnable = async () => {
    if (isGranted) {
      onFinish();
      return;
    }
    const status = await requestLocation();
    if (status === "blocked") {
      setShowBlockedModal(true);
      return;
    }
    onFinish();
  };

  const S = createStyles(colors);

  return (
    <>
      <OnboardingStepWrapper
        step={5}
        title={t("onboarding.location.title", "Precise Prayer Times")}
        subtitle={t(
          "onboarding.location.subtitle",
          "Allow location access for accurate prayer times and Qibla direction.",
        )}
        icon="location-outline"
        primaryLabel={
          isGranted
            ? t("onboarding.location.enabledStatus", "Location Enabled")
            : t("onboarding.location.enableButton", "Enable Location")
        }
        onPrimary={handleEnable}
        onBack={onBack}
        primaryLoading={isLoading}
      >
        {/* Benefits list */}
        <View style={S.benefitsList}>
          {BENEFITS.map((key) => (
            <View key={key} style={S.benefitRow}>
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
          ))}
        </View>

        {/* Success state */}
        {isGranted && (
          <View style={S.successBadge}>
            <Ionicons
              name="checkmark-circle"
              size={rs.icon(18)}
              color={colors.primary}
            />
            <AppText variant="body" family="title" color="primary">
              {t("onboarding.location.enabledStatus", "Location Enabled")}
            </AppText>
          </View>
        )}

        {/* Skip hint */}
        <AppText
          variant="bodyLg"
          color="subtext"
          align="center"
          style={S.hintText}
        >
          {t(
            "onboarding.location.skipHint",
            "Mecca times will be used if skipped",
          )}
        </AppText>
      </OnboardingStepWrapper>

      <MessageModal
        visible={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        title={t("onboarding.location.blockedTitle", "Location Blocked")}
        message={t(
          "onboarding.location.blockedMessage",
          "Location access disabled. Enable in Settings.",
        )}
        icon="location-outline"
        iconColor="#EF4444"
        secondaryButtonText={t("common.cancel", "Cancel")}
        onSecondaryPress={() => setShowBlockedModal(false)}
        primaryButtonText={t("settings.notifications.openSettings", "Open Settings")}
        onPrimaryPress={() => {
          setShowBlockedModal(false);
          void openAppSettings();
        }}
      />
    </>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    benefitsList: {
      backgroundColor: colors.card,
      borderRadius: rs.space(16),
      padding: rs.space(16),
      borderWidth: 1,
      borderColor: colors.border,
      gap: rs.space(12),
      marginBottom: rs.space(12),
    },
    benefitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(12),
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
    successBadge: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: rs.space(6),
      backgroundColor: colors.primary + "18",
      borderRadius: rs.space(10),
      paddingVertical: rs.space(8),
      paddingHorizontal: rs.space(14),
      marginBottom: rs.space(8),
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    hintText: {
      marginTop: rs.space(6),
    },
  });

export default LocationStep;
