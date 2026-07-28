import SafeArea from "@/components/layout/SafeArea";
import EmptyState from "@/components/ui/EmptyState";
import Header from "@/components/ui/Header";
import { useUserLocation } from "@/features/home/hooks/useUserLocation";
import CompassDial from "@/features/qibla/components/CompassDial";
import { useCompass } from "@/features/qibla/hooks/useCompass";
import { useQiblaDirection } from "@/features/qibla/hooks/useQiblaDirection";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
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
  const { colors, spacing, fontFamily, fontSize } = useAppTheme();
  const { coords, permissionStatus, cityName, requestLocation } =
    useUserLocation();

  const qiblaAngle = useQiblaDirection(coords);
  const rotation = useCompass();

  const targetDeg = Math.round(qiblaAngle);

  return (
    <SafeArea>
      <View style={{ flex: 1 }}>
        <Header
          title={t("qiblaScreen.title", "Qibla")}
          subtitle={
            cityName
              ? t("qiblaScreen.subtitleWithCity", "Showing direction from {{cityName}}", { cityName })
              : t("qiblaScreen.subtitleDefault", "Find the direction to Mecca")
          }
        />

        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.screenPadding,
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          {permissionStatus === "denied" ? (
            <EmptyState
              icon="location-outline"
              title={t("qiblaScreen.locationRequiredTitle", "Location Required")}
              subtitle={t(
                "qiblaScreen.locationRequiredSubtitle",
                "We need your location to calculate the precise direction to the Qibla."
              )}
              buttonLabel={t("qiblaScreen.enableLocation", "Enable Location")}
              buttonIcon="location"
              onPress={() => requestLocation()}
            />
          ) : (
            <>
              {/* Top Qibla Target Header (Big Font) */}
              <View style={{ alignItems: "center", marginTop: spacing.xs }}>
                <Text
                  style={{
                    fontFamily: fontFamily.text,
                    fontSize: fontSize.caption,
                    color: colors.subtext,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  {t("qiblaScreen.title", "Qibla")}
                </Text>

                <Text
                  style={{
                    fontFamily: fontFamily.title,
                    fontSize: fontSize.splashTitle,
                    color: colors.primary,
                    marginTop: spacing.xs,
                  }}
                >
                  {targetDeg}°
                </Text>
              </View>

              {/* Center Compass Dial */}
              <CompassDial rotation={rotation} qiblaAngle={qiblaAngle} />

              {/* Bottom Current Heading */}
              <View style={{ alignItems: "center", marginBottom: spacing.md }}>
                <Text
                  style={{
                    fontFamily: fontFamily.text,
                    fontSize: fontSize.body,
                    color: colors.subtext,
                  }}
                >
                  {t("qiblaScreen.currentHeading", "Current Heading")}
                </Text>

                <LiveHeadingText
                  rotation={rotation}
                  style={{
                    fontFamily: fontFamily.title,
                    fontSize: fontSize.splashTitle,
                    color: colors.text,
                    marginTop: spacing.xs,
                    textAlign: "center",
                    padding: 0,
                  }}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </SafeArea>
  );
}
