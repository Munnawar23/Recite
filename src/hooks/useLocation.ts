import { appStorage, STORAGE_KEYS } from "@/lib/storage/appStorage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { Linking } from "react-native";

export const MECCA_COORDS = { latitude: 21.4225, longitude: 39.8262 };

export interface LocationData {
  coords: { latitude: number; longitude: number };
  permissionStatus: "undetermined" | "granted" | "denied";
  cityName?: string;
}

export function useLocation() {
  const queryClient = useQueryClient();

  const locationQuery = useQuery<LocationData>({
    queryKey: ["user-location"],
    queryFn: async () => {
      // 1. Try loading last saved location from appStorage as fallback
      let savedLocationData: LocationData | null = null;
      try {
        savedLocationData = await appStorage.getItem<LocationData>(STORAGE_KEYS.LOCATION);
      } catch (e) {
        console.warn("[useLocation] Error reading location from appStorage:", e);
      }

      try {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") {
          let coords = savedLocationData?.coords || MECCA_COORDS;

          try {
            // Get accurate current GPS position
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            if (loc?.coords) {
              coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
            }
          } catch (e) {
            // Fallback to last known system position if current fix fails (e.g. indoors / airplane mode)
            try {
              const lastLoc = await Location.getLastKnownPositionAsync({});
              if (lastLoc?.coords) {
                coords = {
                  latitude: lastLoc.coords.latitude,
                  longitude: lastLoc.coords.longitude,
                };
              }
            } catch (err) {
              console.warn("[useLocation] Last known position error:", err);
            }
          }

          let cityName: string | undefined = savedLocationData?.cityName;
          try {
            const [geocode] = await Location.reverseGeocodeAsync(coords);
            const resolvedCity = geocode?.city || geocode?.subregion || geocode?.region || undefined;
            if (resolvedCity) {
              cityName = resolvedCity;
            }
          } catch (e) {
            console.warn("[useLocation] Reverse geocoding error:", e);
          }

          const resultData: LocationData = {
            coords,
            permissionStatus: "granted",
            cityName,
          };

          // Save to appStorage whenever permission is granted so it persists forever
          try {
            await appStorage.setItem(STORAGE_KEYS.LOCATION, resultData);
          } catch (e) {
            console.warn("[useLocation] Error saving location to appStorage:", e);
          }

          return resultData;
        }

        // Permission not granted
        return {
          coords: savedLocationData?.coords || MECCA_COORDS,
          permissionStatus: status === "undetermined" ? "undetermined" : "denied",
          cityName: savedLocationData?.cityName,
        };
      } catch (error) {
        console.warn("[useLocation] Could not retrieve user location:", error);
        return {
          coords: savedLocationData?.coords || MECCA_COORDS,
          permissionStatus: savedLocationData ? "granted" : "denied",
          cityName: savedLocationData?.cityName,
        };
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes fresh - checks location when opening app while protecting against rapid app-switching battery spikes
    refetchOnWindowFocus: true,
    initialData: {
      coords: MECCA_COORDS,
      permissionStatus: "undetermined",
      cityName: undefined,
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (): Promise<"granted" | "denied" | "blocked"> => {
      const currentPerm = await Location.getForegroundPermissionsAsync();
      
      if (currentPerm.status === "granted") {
        return "granted";
      }

      if (currentPerm.canAskAgain) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") return "granted";
        return "denied";
      }

      // Permission blocked (permanently denied)
      return "blocked";
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-location"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-times"] });
    },
  });

  return {
    coords: locationQuery.data?.coords ?? MECCA_COORDS,
    permissionStatus: locationQuery.data?.permissionStatus ?? "undetermined",
    cityName: locationQuery.data?.cityName,
    requestLocation: requestMutation.mutateAsync,
    isLoading: locationQuery.isLoading || requestMutation.isPending,
    openAppSettings: async () => {
      await Linking.openSettings();
    },
  };
}
