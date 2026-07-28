import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { QURAN_ANIM } from "@/constants/assets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { lightColors } from "@/theme/colors";

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { colors, fontFamily, fontSize: fontSizes, spacing } = useAppTheme();

  const styles = createStyles(colors, fontFamily, fontSizes, spacing);

  const handleRedirect = useCallback(() => {
    router.replace("/(tabs)/home" as Href);
  }, [router]);

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
        <Text style={styles.title}>{t("splash.title", "Recite")}</Text>

        <Text style={styles.subtitle}>
          {t("splash.subtitle", "Read • Listen • Reflect")}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSizes: any, spacing: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    animation: {
      width: scale(240),
      aspectRatio: 1,
    },

    textContainer: {
      alignItems: "center",
      marginTop: spacing.vXl,
    },

    title: {
      fontSize: fontSizes.splashTitle,
      color: colors.splashText,
      fontFamily: fontFamily.heading,
      letterSpacing: 0.5,
      textAlign: "center",
    },

    subtitle: {
      marginTop: spacing.vXs,
      fontSize: fontSizes.title,
      color: colors.splashSubtext,
      fontFamily: fontFamily.text,
      textAlign: "center",
      letterSpacing: 1.5,
    },
  });
