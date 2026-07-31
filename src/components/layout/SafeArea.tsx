import Background from "@/components/layout/Background";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeAreaProps {
  children: ReactNode;
}

export function SafeArea({ children }: SafeAreaProps) {
  const insets = useSafeAreaInsets();
  const { isOffline } = useNetworkStatus();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: isOffline ? 0 : insets.top },
      ]}
    >
      <Background />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default SafeArea;
