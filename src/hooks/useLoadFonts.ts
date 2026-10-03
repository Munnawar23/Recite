import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

/**
 * Loads custom typography font files at the application root,
 * logs any loading errors, and dismisses the native splash screen when ready.
 */
export function useLoadFonts() {
  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Nunito-SemiBold": require("../../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Medium": require("../../assets/fonts/Nunito-Medium.ttf"),
    "Amiri-Bold": require("../../assets/fonts/Amiri-Bold.ttf"),
  });

  useEffect(() => {
    if (fontError) {
      console.error("Failed to load fonts:", fontError);
    }

    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return {
    fontsLoaded,
    fontError,
    isReady: Boolean(fontsLoaded || fontError),
  };
}
