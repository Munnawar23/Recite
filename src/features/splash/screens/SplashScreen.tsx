import { AppText } from "@/components";
import { QURAN_ANIM } from "@/constants";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingStore } from "@/store/onboardingStore";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { colors, spacing } = useAppTheme();

  const styles = createStyles(spacing);

  const { hasCompletedOnboarding } = useOnboardingStore();

  const handleRedirect = useCallback(() => {
    if (hasCompletedOnboarding) {
      router.replace("/(tabs)/home" as Href);
    } else {
      router.replace("/onboarding" as Href);
    }
  }, [router, hasCompletedOnboarding]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.splashGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LottieView
        source={QURAN_ANIM}
        autoPlay
        loop={false}
        resizeMode="contain"
        onAnimationFinish={handleRedirect}
        style={styles.animation}
      />

      <View style={styles.textContainer}>
        <AppText
          variant="splashTitle"
          color={colors.splashText}
          family="heading"
          align="center"
          letterSpacing={0.5}
        >
          {t("splash.title", "Recite")}
        </AppText>

        <AppText
          variant="title"
          color={colors.splashSubtext}
          family="text"
          align="center"
          letterSpacing={1.5}
          style={styles.subtitle}
        >
          {t("splash.subtitle", "Read • Listen • Reflect")}
        </AppText>
      </View>
    </View>
  );
}

const createStyles = (spacing: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    animation: {
      width: rs.space(240),
      aspectRatio: 1,
    },

    textContainer: {
      alignItems: "center",
      marginTop: spacing.vXl,
    },

    subtitle: {
      marginTop: spacing.vXs,
    },
  });
