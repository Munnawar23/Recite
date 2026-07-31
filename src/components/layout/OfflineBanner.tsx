import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { useGlobalSearchParams, usePathname } from "expo-router";
import { useDownloadsStore } from "@/store/downloadsStore";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ id?: string }>();
  const { downloadedChapters } = useDownloadsStore();

  if (!isOffline) return null;

  // If user is inside surah detail screen and chapter is downloaded, suppress banner
  if (pathname?.includes("/surah/") && params?.id) {
    const chapterId = parseInt(params.id, 10);
    if (downloadedChapters[chapterId]) {
      return null;
    }
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
