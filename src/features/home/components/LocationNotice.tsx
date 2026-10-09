import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { AppText, MessageModal } from "@/components";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocation } from "@/hooks/useLocation";
import { Haptics } from "@/lib/haptics";
import { type ThemeSpacing } from "@/theme";

interface LocationNoticeProps {
  permissionStatus: "undetermined" | "granted" | "denied";
  onPress?: () => Promise<any> | void;
}

export default function LocationNotice({
  permissionStatus,
  onPress,
}: LocationNoticeProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { requestLocation, openAppSettings } = useLocation();
  const [loading, setLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const S = createStyles(spacing);

  useEffect(() => {
    if (permissionStatus === "granted") {
      setLoading(false);
    }
  }, [permissionStatus]);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const handlePress = async () => {
    if (loading) return;
    Haptics.light();
    setLoading(true);
    try {
      const status = onPress ? await onPress() : await requestLocation();
      if (status === "blocked") {
        setShowBlockedModal(true);
        setLoading(false);
      } else if (status === "denied") {
        setLoading(false);
      }
      // If status === "granted", keep loading=true until permissionStatus prop updates to "granted"
    } catch {
      setLoading(false);
    }
  };

  if (permissionStatus === "granted") {
    return null;
  }

  return (
    <>
      <View style={S.container}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            <AppText variant="body" color="subtext" align="center">
              {t("home.locationNotice.showingMecca", "Showing Mecca times.")}{" "}
            </AppText>
            <Pressable
              onPress={handlePress}
              style={({ pressed }) => [pressed && S.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t(
                "home.locationNotice.enableLocation",
                "Enable location permission",
              )}
            >
              <AppText
                variant="body"
                color="primary"
                family="title"
                style={S.settingsLink}
              >
                {t("home.locationNotice.enableLocation", "Tap to enable location")}
              </AppText>
            </Pressable>
          </>
        )}
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

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    container: {
      marginTop: spacing.vLg,
      paddingHorizontal: spacing.screenPadding,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    settingsLink: {
      textDecorationLine: "underline",
    },
    pressed: {
      opacity: 0.6,
    },
  });
