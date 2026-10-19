import { FontSizeScale } from "@/store/fontStore";

export const FONT_SCALE_MULTIPLIER: Record<FontSizeScale, number> = {
  small: 0.88,
  default: 1,
  large: 1.12,
} as const;

export const getFontSizeTabs = (t: (key: string, fallback: string) => string) => [
  {
    label: t("settings.display.fontSize.small", "Small"),
    value: "small" as FontSizeScale,
  },
  {
    label: t("settings.display.fontSize.default", "Default"),
    value: "default" as FontSizeScale,
  },
  {
    label: t("settings.display.fontSize.large", "Large"),
    value: "large" as FontSizeScale,
  },
];
