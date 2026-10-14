import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    insets,
  };
}

