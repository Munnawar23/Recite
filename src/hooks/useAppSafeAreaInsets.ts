import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "./useNetworkStatus";

export interface SafeAreaInsetsResult {
  top: number;
  bottom: number;
  left: number;
  right: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

export function useAppSafeAreaInsets(): SafeAreaInsetsResult {
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();
  const pathname = usePathname();

  const isBannerSuppressed =
    !pathname ||
    pathname === "/" ||
    pathname === "/index" ||
    pathname.includes("onboarding") ||
    pathname.includes("quran-detail");

  const calculatedTop = isOffline && !isBannerSuppressed ? 0 : insets.top;

  return {
    top: calculatedTop,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    paddingTop: calculatedTop,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    insets,
  };
}
