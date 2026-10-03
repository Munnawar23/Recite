import { AppText } from "@/components";
import { rs, verticalScale } from "@/helpers/responsiveHelper";
import { usePrayerTimes } from "@/features/home/hooks/usePrayerTimes";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import LocationNotice from "./LocationNotice";

export default function PrayerTimes() {
  const { t } = useTranslation();
  const { colors, fontSize, spacing, activeScheme } = useAppTheme();
  const S = createStyles(
    colors,
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

            <AppText
              variant="caption"
              family="title"
              color={prayer.active ? "#fff" : "subtext"}
              letterSpacing={0.2}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {t(`home.prayerNames.${prayer.name.toLowerCase()}`, prayer.name)}
            </AppText>

            <AppText
              variant="caption"
              family="text"
              color={prayer.active ? "rgba(255,255,255,0.85)" : "subtext"}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {prayer.time}
            </AppText>
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
      gap: rs.space(7),
    },

    pill: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: rs.space(16),
      paddingVertical: verticalScale(14),
      paddingHorizontal: rs.space(2),

      alignItems: "center",
      justifyContent: "center",
      gap: verticalScale(4),

      borderWidth: 1,
      borderColor: colors.border,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: rs.space(1),
      },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: rs.space(4),
      elevation: 2,
    },

    pillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,

      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: rs.space(4),
      },
      shadowOpacity: 0.35,
      shadowRadius: rs.space(10),
      elevation: 6,
    },
  });
