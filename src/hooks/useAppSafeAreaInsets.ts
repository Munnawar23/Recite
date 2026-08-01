import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "./useNetworkStatus";

export interface SafeAreaInsetsResult {
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** Insets directly for style padding */
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  insets: ReturnType<typeof useSafeAreaInsets>;
}

/**
 * Custom hook to get safe area insets and calculated padding for screens/components.
 * Automatically accounts for offline banner height on top inset.
 */
export function useAppSafeAreaInsets(): SafeAreaInsetsResult {
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();

  // If offline banner is showing, top inset is handled by OfflineBanner component
  const calculatedTop = isOffline ? 0 : insets.top;

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
