import { useFontStore } from "@/store/fontStore";
import { FONT_SCALE_MULTIPLIER } from "@/theme/fontScale";
import { fonts } from "@/theme/fonts";
import { useMemo } from "react";

export function useAppFonts() {
  const { fontSizeScale, setFontSizeScale } = useFontStore();

  const fontSize = useMemo(() => {
    const multiplier = FONT_SCALE_MULTIPLIER[fontSizeScale] ?? 1;
    if (multiplier === 1) return fonts.size;

    const scaledEntries = Object.entries(fonts.size).map(([key, val]) => [
      key,
      Math.round(val * multiplier),
    ]);
    return Object.fromEntries(scaledEntries) as typeof fonts.size;
  }, [fontSizeScale]);

  const lineHeight = useMemo(() => {
    const multiplier = FONT_SCALE_MULTIPLIER[fontSizeScale] ?? 1;
    if (multiplier === 1) return fonts.lineHeight;

    const scaledEntries = Object.entries(fonts.lineHeight).map(([key, val]) => [
      key,
      Math.round(val * multiplier),
    ]);
    return Object.fromEntries(scaledEntries) as typeof fonts.lineHeight;
  }, [fontSizeScale]);

  return {
    fontFamily: fonts.family,
    fontSize,
    lineHeight,
    letterSpacing: fonts.letterSpacing,
    fontSizeScale,
    setFontSizeScale,
  };
}
