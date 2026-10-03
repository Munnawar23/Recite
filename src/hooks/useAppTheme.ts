import { useAppFonts } from "@/hooks/useAppFonts";
import { useThemeStore } from "@/store/themeStore";
import { spacing, theme } from "@/theme";
import { useColorScheme } from "react-native";

export function useAppTheme() {
  const { themeMode, setThemeMode } = useThemeStore();
  const systemColorScheme = useColorScheme();
  const appFonts = useAppFonts();

  const activeScheme: "light" | "dark" =
    themeMode === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const colors = theme[activeScheme].colors;

  return {
    themeMode,
    setThemeMode,
    activeScheme,
    colors,
    spacing,
    ...appFonts,
  };
}
