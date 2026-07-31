import { useNetInfo } from "@react-native-community/netinfo";

/**
 * Hook to get real-time network connection status.
 */
export function useNetworkStatus() {
  const netInfo = useNetInfo();

  // Consider offline if isConnected or isInternetReachable is explicitly false
  const isOffline =
    netInfo.isConnected === false || netInfo.isInternetReachable === false;

  return {
    isOffline,
    isConnected: !isOffline,
    netInfo,
  };
}
