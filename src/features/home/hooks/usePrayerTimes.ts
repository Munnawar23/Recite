import { Ionicons } from "@expo/vector-icons";
import {
  PrayerTimes as AdhanPrayerTimes,
  CalculationMethod,
  Coordinates,
} from "adhan";
import { useMemo } from "react";

import { useLocation } from "@/hooks/useLocation";
import { formatPrayerTime } from "@/utils/dateUtils";

export type Prayer = {
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
};

const getActivePrayer = (
  nextPrayer: ReturnType<AdhanPrayerTimes["nextPrayer"]>,
): Prayer["name"] | "" => {
  switch (nextPrayer) {
    case "fajr":
    case "none":
      return "Fajr";

    case "sunrise":
    case "dhuhr":
      return "Dhuhr";

    case "asr":
      return "Asr";

    case "maghrib":
      return "Maghrib";

    case "isha":
      return "Isha";

    default:
      return "";
  }
};

export function usePrayerTimes() {
  const { coords, permissionStatus, cityName, isLoading, requestLocation } =
    useLocation();

  const prayerData = useMemo(() => {
    const coordinates = new Coordinates(coords.latitude, coords.longitude);

    const params = CalculationMethod.UmmAlQura();

    const adhanTimes = new AdhanPrayerTimes(coordinates, new Date(), params);

    const activePrayer = getActivePrayer(adhanTimes.nextPrayer());

    const prayers: Prayer[] = [
      {
        name: "Fajr",
        time: formatPrayerTime(adhanTimes.fajr),
        icon: "moon-outline",
        active: activePrayer === "Fajr",
      },
      {
        name: "Dhuhr",
        time: formatPrayerTime(adhanTimes.dhuhr),
        icon: "sunny-outline",
        active: activePrayer === "Dhuhr",
      },
      {
        name: "Asr",
        time: formatPrayerTime(adhanTimes.asr),
        icon: "partly-sunny-outline",
        active: activePrayer === "Asr",
      },
      {
        name: "Maghrib",
        time: formatPrayerTime(adhanTimes.maghrib),
        icon: "cloudy-night-outline",
        active: activePrayer === "Maghrib",
      },
      {
        name: "Isha",
        time: formatPrayerTime(adhanTimes.isha),
        icon: "star-outline",
        active: activePrayer === "Isha",
      },
    ];

    return prayers;
  }, [coords]);

  return {
    prayerData,
    permissionStatus,
    cityName,
    isLoading,
    requestLocation,
  };
}
