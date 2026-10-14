import { FontSizeScale } from "@/store/fontStore";


export const FONT_SCALE_MULTIPLIER: Record<FontSizeScale, number> = {
  default: 1,
  large: 1.12,
  extraLarge: 1.25,
} as const;


