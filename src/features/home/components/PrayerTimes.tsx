import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import { usePrayerTimes } from "@/features/home/hooks/usePrayerTimes";
import { useAppTheme } from "@/hooks/useAppTheme";

import LocationNotice from "./LocationNotice";

export default function PrayerTimes() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, spacing, activeScheme } = useAppTheme();
  const S = createStyles(
    colors,
    fontFamily,
    fontSize,
    spacing,
    activeScheme === "dark",
  );

  const { prayerData, permissionStatus, requestLocation } = usePrayerTimes();

  return (
    <View style={S.container}>
      <View style={S.row}>
        {prayerData.map((prayer) => (
          <View
            key={prayer.name}
            style={[S.pill, prayer.active && S.pillActive]}
          >
            <Ionicons
              name={prayer.icon}
              size={fontSize.title}
              color={prayer.active ? "#fff" : colors.subtext}
            />

            <Text
              style={[S.name, prayer.active && S.nameActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t(`home.prayerNames.${prayer.name.toLowerCase()}`, prayer.name)}
            </Text>

            <Text
              style={[S.time, prayer.active && S.timeActive]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {prayer.time}
            </Text>
          </View>
        ))}
      </View>

      <LocationNotice
        permissionStatus={permissionStatus}
        onPress={requestLocation}
      />
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
  isDark: boolean,
) =>
  StyleSheet.create({
    container: {
      gap: spacing.vXs,
    },

    row: {
      flexDirection: "row",
      paddingHorizontal: spacing.screenPadding,
      gap: scale(7),
    },

    pill: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: scale(16),
      paddingVertical: verticalScale(14),
      paddingHorizontal: scale(2),

      alignItems: "center",
      justifyContent: "center",
      gap: verticalScale(4),

      borderWidth: 1,
      borderColor: colors.border,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: verticalScale(1),
      },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: scale(4),
      elevation: 2,
    },

    pillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,

      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: verticalScale(4),
      },
      shadowOpacity: 0.35,
      shadowRadius: scale(10),
      elevation: 6,
    },

    name: {
      fontSize: fontSize.caption,
      fontFamily: fontFamily.title,
      color: colors.subtext,
      letterSpacing: 0.2,
      textAlign: "center",
    },

    nameActive: {
      color: "#fff",
    },

    time: {
      fontSize: fontSize.caption,
      fontFamily: fontFamily.text,
      color: colors.subtext,
      textAlign: "center",
    },

    timeActive: {
      color: "rgba(255,255,255,0.85)",
    },
  });
