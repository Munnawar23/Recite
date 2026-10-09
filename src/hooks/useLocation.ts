import { appStorage, STORAGE_KEYS } from "@/lib/storage/appStorage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { Linking } from "react-native";

export const MECCA_COORDS = { latitude: 21.4225, longitude: 39.8262 };

export interface LocationData {
  coords: { latitude: number; longitude: number };
  permissionStatus: "undetermined" | "granted" | "denied";
  cityName?: string;
  isDefaultLocation?: boolean;
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
          let hasRealCoords =
            !!savedLocationData?.coords &&
            !savedLocationData.isDefaultLocation &&
            !(
              savedLocationData.coords.latitude === MECCA_COORDS.latitude &&
              savedLocationData.coords.longitude === MECCA_COORDS.longitude
            );

          // Fast path: try cached OS position first (< 50ms)
          try {
            const lastLoc = await Location.getLastKnownPositionAsync({});
            if (lastLoc?.coords) {
              coords = {
                latitude: lastLoc.coords.latitude,
                longitude: lastLoc.coords.longitude,
              };
              hasRealCoords = true;
            }
          } catch (err) {
            console.warn("[useLocation] Last known position error:", err);
          }

          // Balanced fresh GPS fix
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            if (loc?.coords) {
              coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
              hasRealCoords = true;
            }
          } catch (e) {
            // Already populated by lastLoc or savedLocationData
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
            isDefaultLocation: !hasRealCoords,
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
          isDefaultLocation: true,
        };
      } catch (error) {
        console.warn("[useLocation] Could not retrieve user location:", error);
        return {
          coords: savedLocationData?.coords || MECCA_COORDS,
          permissionStatus: savedLocationData ? "granted" : "denied",
          cityName: savedLocationData?.cityName,
          isDefaultLocation: !savedLocationData?.coords,
        };
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes fresh
    refetchOnWindowFocus: true,
    initialData: {
      coords: MECCA_COORDS,
      permissionStatus: "undetermined",
      cityName: undefined,
      isDefaultLocation: true,
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (): Promise<"granted" | "denied" | "blocked"> => {
      const currentPerm = await Location.getForegroundPermissionsAsync();

      let finalStatus: "granted" | "denied" | "blocked" = "denied";
      
      if (currentPerm.status === "granted") {
        finalStatus = "granted";
      } else if (currentPerm.canAskAgain) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          finalStatus = "granted";
        } else {
          finalStatus = "denied";
        }
      } else {
        finalStatus = "blocked";
      }

      // If permission is granted, immediately acquire cached location (< 50ms)
      // and prime the React Query cache BEFORE the mutation promise resolves!
      if (finalStatus === "granted") {
        try {
          const lastLoc = await Location.getLastKnownPositionAsync({});
          if (lastLoc?.coords) {
            queryClient.setQueryData<LocationData>(["user-location"], (old) => ({
              coords: {
                latitude: lastLoc.coords.latitude,
                longitude: lastLoc.coords.longitude,
              },
              permissionStatus: "granted",
              cityName: old?.cityName,
              isDefaultLocation: false,
            }));
          }
        } catch (e) {
          console.warn("[useLocation] Error fetching last known position in mutationFn:", e);
        }
      }

      return finalStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-location"] });
      queryClient.invalidateQueries({ queryKey: ["prayer-times"] });
    },
  });

  const coords = locationQuery.data?.coords ?? MECCA_COORDS;
  const isDefaultLocation =
    locationQuery.data?.isDefaultLocation ??
    (coords.latitude === MECCA_COORDS.latitude &&
      coords.longitude === MECCA_COORDS.longitude);

  return {
    coords,
    permissionStatus: locationQuery.data?.permissionStatus ?? "undetermined",
    cityName: locationQuery.data?.cityName,
    requestLocation: requestMutation.mutateAsync,
    isLoading: locationQuery.isLoading || requestMutation.isPending,
    isDefaultLocation,
    openAppSettings: async () => {
      await Linking.openSettings();
    },
  };
}
