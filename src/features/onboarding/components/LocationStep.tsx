import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocation } from "@/hooks/useLocation";
import { MessageModal } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
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

  const S = createStyles(colors, fontFamily, fontSize, spacing);

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
                  size={scale(14)}
                  color={colors.primary}
                />
              </View>
              <Text style={S.benefitText}>{t(key)}</Text>
            </View>
          ))}
        </View>

        {/* Success state */}
        {isGranted && (
          <View style={S.successBadge}>
            <Ionicons
              name="checkmark-circle"
              size={scale(18)}
              color={colors.primary}
            />
            <Text style={S.successText}>
              {t("onboarding.location.enabledStatus", "Location Enabled")}
            </Text>
          </View>
        )}

        {/* Skip hint */}
        <Text style={S.hintText}>
          {t(
            "onboarding.location.skipHint",
            "Mecca times will be used if skipped",
          )}
        </Text>
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

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
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

export default LocationStep;
