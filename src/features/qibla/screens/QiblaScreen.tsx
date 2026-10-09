import { AppText, EmptyState, Header, MessageModal } from "@/components";
import CompassDial from "@/features/qibla/components/CompassDial";
import { useCompass } from "@/features/qibla/hooks/useCompass";
import { useQiblaDirection } from "@/features/qibla/hooks/useQiblaDirection";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useBottomTabBarSpacing } from "@/hooks/useBottomTabBarSpacing";
import { useLocation } from "@/hooks/useLocation";
import { usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function LiveHeadingText({
  rotation,
  style,
}: {
  rotation: SharedValue<number>;
  style: any;
}) {
  const animatedProps = useAnimatedProps(() => {
    const deg = Math.round(((rotation.value % 360) + 360) % 360);
    return {
      text: `${deg}°`,
      value: `${deg}°`,
    } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      maxFontSizeMultiplier={1.2}
      style={style}
      animatedProps={animatedProps}
    />
  );
}

export default function QiblaScreen() {
  const pathname = usePathname();
  const isFocused = pathname === "/qibla";
  const { t } = useTranslation();
  const theme = useAppTheme();
  const bottomSpacing = useBottomTabBarSpacing();
  const styles = createStyles(theme, bottomSpacing);
  const { coords, permissionStatus, cityName, requestLocation, openAppSettings, isLoading } =
    useLocation();
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleRequestLocation = async () => {
    const status = await requestLocation();
    if (status === "blocked") {
      setShowBlockedModal(true);
    }
  };

  const qiblaAngle = useQiblaDirection(coords);
  const rotation = useCompass();

  const targetDeg = Math.round(qiblaAngle);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Header
          title={t("qiblaScreen.title", "Qibla")}
          subtitle={
            cityName
              ? t(
                  "qiblaScreen.subtitleWithCity",
                  "Showing direction from {{cityName}}",
                  { cityName },
                )
              : t("qiblaScreen.subtitleDefault", "Find the direction to Mecca")
          }
        />

        <View style={styles.content}>
          {permissionStatus !== "granted" ? (
            <EmptyState
              icon="location-outline"
              title={t(
                "qiblaScreen.locationRequiredTitle",
                "Location Required",
              )}
              subtitle={t(
                "qiblaScreen.locationRequiredSubtitle",
                "We need your location to calculate the precise direction to the Qibla.",
              )}
              buttonLabel={t("qiblaScreen.enableLocation", "Enable Location")}
              buttonIcon="location"
              loading={isLoading}
              onPress={handleRequestLocation}
            />
          ) : (
            <>
              {/* Top Qibla Target Header (Big Font) */}
              <View style={styles.targetContainer}>
                <AppText
                  variant="caption"
                  family="text"
                  color="subtext"
                  letterSpacing={1.5}
                  style={styles.targetLabel}
                >
                  {t("qiblaScreen.title", "Qibla")}
                </AppText>

                <AppText
                  variant="splashTitle"
                  family="title"
                  color="primary"
                  style={styles.targetValue}
                >
                  {targetDeg}°
                </AppText>
              </View>

              {/* Center Compass Dial */}
              <CompassDial
                rotation={rotation}
                qiblaAngle={qiblaAngle}
                active={isFocused}
              />

              {/* Bottom Current Heading */}
              <View style={styles.headingContainer}>
                <AppText
                  variant="body"
                  family="text"
                  color="subtext"
                >
                  {t("qiblaScreen.currentHeading", "Current Heading")}
                </AppText>

                <LiveHeadingText
                  rotation={rotation}
                  style={styles.headingValue}
                />
              </View>
            </>
          )}
        </View>
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
    </View>
  );
}

const createStyles = (
  theme: ReturnType<typeof useAppTheme>,
  bottomSpacing: number,
) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.screenPadding,
      paddingBottom: bottomSpacing,
      alignItems: "center",
      justifyContent: "space-evenly",
    },
    targetContainer: {
      alignItems: "center",
      marginTop: theme.spacing.xs,
    },
    targetLabel: {
      textTransform: "uppercase",
    },
    targetValue: {
      marginTop: theme.spacing.xs,
    },
    headingContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    headingValue: {
      fontFamily: theme.fontFamily.title,
      fontSize: theme.fontSize.splashTitle,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
      textAlign: "center",
      padding: 0,
    },
  });
