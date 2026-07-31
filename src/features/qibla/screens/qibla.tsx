import EmptyState from "@/components/layout/EmptyState";
import Header from "@/components/layout/Header";
import SafeArea from "@/components/layout/SafeArea";
import CompassDial from "@/features/qibla/components/CompassDial";
import { useCompass } from "@/features/qibla/hooks/useCompass";
import { useQiblaDirection } from "@/features/qibla/hooks/useQiblaDirection";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocation } from "@/hooks/useLocation";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, View } from "react-native";
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
      style={style}
      animatedProps={animatedProps}
    />
  );
}

export default function QiblaScreen() {
  const { t } = useTranslation();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const { coords, permissionStatus, cityName, requestLocation, isLoading } =
    useLocation();

  const qiblaAngle = useQiblaDirection(coords);
  const rotation = useCompass();

  const targetDeg = Math.round(qiblaAngle);

  return (
    <SafeArea>
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
              onPress={() => requestLocation()}
            />
          ) : (
            <>
              {/* Top Qibla Target Header (Big Font) */}
              <View style={styles.targetContainer}>
                <Text style={styles.targetLabel}>
                  {t("qiblaScreen.title", "Qibla")}
                </Text>

                <Text style={styles.targetValue}>{targetDeg}°</Text>
              </View>

              {/* Center Compass Dial */}
              <CompassDial rotation={rotation} qiblaAngle={qiblaAngle} />

              {/* Bottom Current Heading */}
              <View style={styles.headingContainer}>
                <Text style={styles.headingLabel}>
                  {t("qiblaScreen.currentHeading", "Current Heading")}
                </Text>

                <LiveHeadingText
                  rotation={rotation}
                  style={styles.headingValue}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </SafeArea>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.screenPadding,
      alignItems: "center",
      justifyContent: "space-evenly",
    },
    targetContainer: {
      alignItems: "center",
      marginTop: theme.spacing.xs,
    },
    targetLabel: {
      fontFamily: theme.fontFamily.text,
      fontSize: theme.fontSize.caption,
      color: theme.colors.subtext,
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    targetValue: {
      fontFamily: theme.fontFamily.title,
      fontSize: theme.fontSize.splashTitle,
      color: theme.colors.primary,
      marginTop: theme.spacing.xs,
    },
    headingContainer: {
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    headingLabel: {
      fontFamily: theme.fontFamily.text,
      fontSize: theme.fontSize.body,
      color: theme.colors.subtext,
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
