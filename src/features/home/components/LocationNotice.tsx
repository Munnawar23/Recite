import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import MessageModal from "@/components/ui/MessageModal";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocation } from "@/hooks/useLocation";
import { Haptics } from "@/lib/haptics";

interface LocationNoticeProps {
  permissionStatus: "undetermined" | "granted" | "denied";
  onPress?: () => void;
}

export default function LocationNotice({
  permissionStatus,
  onPress,
}: LocationNoticeProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { requestLocation, openAppSettings } = useLocation();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const S = createStyles(colors, fontFamily, fontSize, spacing);

  const handlePress = async () => {
    Haptics.medium();
    if (onPress) {
      onPress();
    }
    const status = await requestLocation();
    if (status === "blocked") {
      setShowBlockedModal(true);
    }
  };

  if (permissionStatus === "granted") {
    return null;
  }

  return (
    <>
      <View style={S.container}>
        <Text style={S.infoText}>
          {t("home.locationNotice.showingMecca", "Showing Mecca times.")}{" "}
        </Text>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [pressed && S.pressed]}
          accessibilityRole="button"
          accessibilityLabel={t(
            "home.locationNotice.enableLocation",
            "Enable location permission",
          )}
        >
          <Text style={S.settingsLink}>
            {t("home.locationNotice.enableLocation", "Tap to enable location")}
          </Text>
        </Pressable>
      </View>

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
    container: {
      marginTop: spacing.vLg,
      paddingHorizontal: spacing.screenPadding,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
    },

    infoText: {
      textAlign: "center",
      color: colors.subtext,
      fontSize: fontSize.body,
      fontFamily: fontFamily.text,
    },

    settingsLink: {
      color: colors.primary,
      fontFamily: fontFamily.title,
      textDecorationLine: "underline",
    },
    pressed: {
      opacity: 0.6,
    },
  });
