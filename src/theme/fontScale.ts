import { FontSizeScale } from "@/store/fontStore";

export const FONT_SCALE_MULTIPLIER: Record<FontSizeScale, number> = {
  default: 1,
  large: 1.12,
  extraLarge: 1.25,
} as const;

export const getFontSizeTabs = (t: (key: string, fallback: string) => string) => [
  {
    label: t("settings.display.fontSize.default", "Default"),
    value: "default" as FontSizeScale,
  },
  {
    label: t("settings.display.fontSize.large", "Large"),
    value: "large" as FontSizeScale,
  },
  {
    label: t("settings.display.fontSize.extraLarge", "Max"),
    value: "extraLarge" as FontSizeScale,
  },
];
