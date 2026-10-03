import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Ionicons } from "@expo/vector-icons";
import { usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./AppText";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const { colors, spacing } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  if (!isOffline) return null;

  // Suppress banner on splash screen, onboarding flow, and quran-detail screen
  if (
    !pathname ||
    pathname === "/" ||
    pathname === "/index" ||
    pathname.includes("onboarding") ||
    pathname.includes("quran-detail")
  ) {
    return null;
  }

  const S = createStyles(colors, spacing, insets.top);

  return (
    <View style={S.banner}>
      <Ionicons
        name="cloud-offline-outline"
        size={rs.icon(18)}
        color="#FFF"
        style={S.icon}
      />
      <AppText variant="bodySm" color="#FFFFFF" style={S.text}>
        {t(
          "common.offlineBanner",
          "You are offline. You can still read the Quran and listen to downloaded audio.",
        )}
      </AppText>
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
  topInset: number,
) =>
  StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.screenPadding,
      paddingTop: topInset + rs.space(4),
      paddingBottom: rs.space(6),
      justifyContent: "center",
      backgroundColor: colors.primary + "E6",
    },
    icon: {
      marginRight: spacing.itemGap,
    },
    text: {
      color: "#FFFFFF",
      flex: 1,
      textAlign: "left",
    },
  });

export default OfflineBanner;
