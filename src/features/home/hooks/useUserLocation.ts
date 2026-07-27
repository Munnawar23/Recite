import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { Linking } from "react-native";

export const MECCA_COORDS = { latitude: 21.4225, longitude: 39.8262 };

export interface LocationData {
  coords: { latitude: number; longitude: number };
  permissionStatus: "undetermined" | "granted" | "denied";
  cityName?: string;
}

export function useUserLocation() {
  const queryClient = useQueryClient();

  const locationQuery = useQuery<LocationData>({
    queryKey: ["user-location"],
    queryFn: async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") {
          let coords = MECCA_COORDS;
          const lastLoc = await Location.getLastKnownPositionAsync({});
          if (lastLoc?.coords) {
            coords = {
              latitude: lastLoc.coords.latitude,
              longitude: lastLoc.coords.longitude,
            };
          } else {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            if (loc?.coords) {
              coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              };
            }
          }

          let cityName: string | undefined;
          try {
            const [geocode] = await Location.reverseGeocodeAsync(coords);
            cityName = geocode?.city || geocode?.subregion || geocode?.region || undefined;
          } catch (e) {
            console.warn("Reverse geocoding error:", e);
          }

          return {
            coords,
            permissionStatus: "granted",
            cityName,
          };
        }

        return {
          coords: MECCA_COORDS,
          permissionStatus:
            status === "undetermined" ? "undetermined" : "denied",
          cityName: "Mecca",
        };
      } catch (error) {
        console.warn("Could not retrieve user location:", error);
        return {
          coords: MECCA_COORDS,
          permissionStatus: "denied",
          cityName: "Mecca",
        };
      }
    },
    initialData: {
      coords: MECCA_COORDS,
      permissionStatus: "undetermined",
      cityName: undefined,
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      const currentPerm = await Location.getForegroundPermissionsAsync();
      if (currentPerm.canAskAgain) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status;
      }
      if (currentPerm.status === Location.PermissionStatus.DENIED) {
        await Linking.openSettings();
        return "denied";
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status;
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
    requestLocation: requestMutation.mutate,
    isLoading: locationQuery.isLoading || requestMutation.isPending,
  };
}
