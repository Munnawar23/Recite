import { useEffect, useState, useCallback, useRef } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

export type NetInfoType = NetInfoState["type"];

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
  type: NetInfoType;
  /** True once NetInfo has delivered its first network status reading */
  isKnown: boolean;
}

export function useNetwork() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: null,
    isOffline: false,
    type: "unknown",
    isKnown: false,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const updateState = useCallback((state: NetInfoState) => {
    if (!mountedRef.current) return;

    const isConnected = state.isConnected ?? true;
    const isInternetReachable = state.isInternetReachable;
    const isOffline = !isConnected || isInternetReachable === false;

    setNetworkState({
      isConnected,
      isInternetReachable,
      isOffline,
      type: state.type,
      isKnown: true,
    });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      if (mountedRef.current) {
        updateState(state);
      }
    } catch (e) {
      console.warn("[useNetwork] refresh failed:", e);
    }
  }, [updateState]);

  useEffect(() => {
    // NetInfo.addEventListener immediately emits current state on subscription
    const unsubscribe = NetInfo.addEventListener(updateState);

    return () => {
      unsubscribe();
    };
  }, [updateState]);

  return {
    ...networkState,
    refresh,
  };
}

export default useNetwork;
