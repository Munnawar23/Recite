import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";

interface LocationNoticeProps {
  permissionStatus: "undetermined" | "granted" | "denied";
  onPress: () => void;
}

export default function LocationNotice({
  permissionStatus,
  onPress,
}: LocationNoticeProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize, spacing);

  const handlePress = () => {
    Haptics.medium();
    onPress();
  };

  if (permissionStatus === "granted") {
    return null;
  }

  return (
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
