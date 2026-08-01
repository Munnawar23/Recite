import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { useAppTheme } from "@/hooks/useAppTheme";
import i18n from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Keep the splash screen visible while we fetch resources
void SplashScreen.preventAutoHideAsync();

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "RECITE_QUERY_CACHE_V2",
});

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 30, // 30 mins
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
          },
        },
      }),
  );

  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Nunito-SemiBold": require("../../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Medium": require("../../assets/fonts/Nunito-Medium.ttf"),
    "Amiri-Bold": require("../../assets/fonts/Amiri-Bold.ttf"),
  });

  const { activeScheme } = useAppTheme();

  useEffect(() => {
    if (fontError) {
      console.error("Failed to load fonts:", fontError);
    }

    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <PersistQueryClientProvider
              client={queryClient}
              persistOptions={{
                persister: asyncStoragePersister,
                maxAge: 1000 * 60 * 60 * 24, // 24 hours max cache age
                buster: "v2",
                dehydrateOptions: {
                  shouldDehydrateQuery: (query) => {
                    const keyStr = JSON.stringify(query.queryKey);
                    if (
                      keyStr.includes("chapters") ||
                      keyStr.includes("verses")
                    ) {
                      return false;
                    }
                    return query.state.status === "success";
                  },
                },
              }}
            >
              <StatusBar style={activeScheme === "dark" ? "light" : "dark"} />
              <OfflineBanner />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { flex: 1 },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="surah/[id]" />
                <Stack.Screen name="settings/display" />
                <Stack.Screen name="settings/languages" />
              </Stack>
              <Toast />
            </PersistQueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
