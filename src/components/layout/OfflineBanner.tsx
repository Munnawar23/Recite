import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { usePathname } from "expo-router";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  if (!isOffline) return null;

  // Suppress banner on splash screen and onboarding flow
  if (!pathname || pathname === "/" || pathname === "/index" || pathname.includes("onboarding")) {
    return null;
  }

  const S = createStyles(colors, fontFamily, fontSize, spacing, insets.top);

  return (
    <View style={S.banner}>
      <Ionicons
        name="cloud-offline-outline"
        size={scale(18)}
        color="#FFF"
        style={S.icon}
      />
      <Text style={S.text}>
        {t(
          "common.offlineBanner",
          "You are offline. You can still read the Quran and listen to downloaded audio.",
        )}
      </Text>
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
  topInset: number,
) =>
  StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.screenPadding,
      paddingTop: topInset + spacing.vXs,
      paddingBottom: spacing.vSm,
      justifyContent: "center",
      backgroundColor: colors.primary + "E6",
    },
    icon: {
      marginRight: spacing.itemGap,
    },
    text: {
      color: "#FFFFFF",
      fontFamily: fontFamily.text,
      fontSize: fontSize.body ?? scale(13),
      flex: 1,
      textAlign: "left",
    },
  });
