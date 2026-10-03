import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  fontSize,
  letterSpacing,
  lineHeight,
  type ThemeColors,
  type ThemeFontFamily,
  type ThemeFontSize,
} from "@/theme";
import React, { forwardRef } from "react";
import {
  Text as RNText,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from "react-native";
import Animated from "react-native-reanimated";

// ─── Types & Presets ──────────────────────────────────────────────────────────

/** Typography preset names (e.g. 'body', 'heading', 'caption', 'arabic', 'splashTitle') */
export type TextVariant = keyof ThemeFontSize;

/** Available font weights from theme */
export type TextWeight = keyof ThemeFontFamily;

/** Theme color token or any custom hex/rgb color string */
export type TextColor = keyof ThemeColors | (string & {});

// ─── Component Props ──────────────────────────────────────────────────────────

export interface AppTextProps extends Omit<TextProps, "style"> {
  /**
   * Predefined typography preset combining font size, line height, letter spacing, and font family.
   * Options: 'caption' | 'bodySm' | 'body' | 'bodyLg' | 'title' | 'cardTitle' | 'heading' | 'largeTitle' | 'splashTitle' | 'arabic'
   * @default 'body'
   */
  variant?: TextVariant;

  /**
   * Text color from theme ('text' | 'subtext' | 'primary' | 'card' | 'background' | 'border') or custom hex/rgb.
   * @default 'text'
   */
  color?: TextColor;

  /** Optional font size override (ThemeFontSize key or custom number) */
  size?: TextVariant | number;

  /** Optional line height override */
  lineHeight?: number;

  /** Optional letter spacing override */
  letterSpacing?: number;

  /** Optional font family / weight override */
  weight?: TextWeight | TextStyle["fontWeight"];
  fontWeight?: TextStyle["fontWeight"];
  family?: TextWeight;
  fontFamily?: TextWeight;

  /** Shorthand weight flags */
  bold?: boolean;
  semiBold?: boolean;
  medium?: boolean;

  /** Text alignment shorthand */
  align?: TextStyle["textAlign"];

  /** Additional custom text styles (overrides defaults) */
  style?: StyleProp<TextStyle>;

  children?: React.ReactNode;
}

// ─── Main AppText Component ───────────────────────────────────────────────────

export const AppText = forwardRef<RNText, AppTextProps>(function AppText(
  {
    variant = "body",
    color = "text",
    size,
    lineHeight: customLineHeight,
    letterSpacing: customLetterSpacing,
    weight,
    fontWeight: fontWeightProp,
    family,
    fontFamily: fontFamilyProp,
    bold,
    semiBold,
    medium,
    align,
    style,
    children,
    maxFontSizeMultiplier = 1.2, // Limits system accessibility zoom to 1.2x to prevent UI overflow
    ...rest
  },
  ref,
) {
  // Get active theme colors, font families, font sizes, line heights, and theme mode
  const {
    colors,
    fontFamily,
    fontSize: themeFontSize,
    lineHeight: themeLineHeight,
  } = useAppTheme();

  // ── Step 1: Calculate Responsive Font Size ──
  // If custom number is passed, scale it with rs.font(). Otherwise use active theme token preset.
  const resolvedSize =
    typeof size === "number"
      ? rs.font(size)
      : size && size in themeFontSize
        ? themeFontSize[size as keyof ThemeFontSize]
        : (themeFontSize[variant] ?? themeFontSize.body);

  // ── Step 2: Calculate Line Height ──
  // Pairs line height with font size to prevent text from clipping at the top/bottom
  const resolvedLineHeight =
    typeof customLineHeight === "number"
      ? customLineHeight
      : typeof size === "number"
        ? Math.round(resolvedSize * 1.35)
        : size && size in themeLineHeight
          ? themeLineHeight[size as keyof ThemeFontSize]
          : (themeLineHeight[variant] ?? themeLineHeight.body);

  // ── Step 3: Calculate Letter Spacing ──
  // Spacing between characters for crisp readability
  const resolvedLetterSpacing =
    typeof customLetterSpacing === "number"
      ? customLetterSpacing
      : size && size in letterSpacing
        ? letterSpacing[size as keyof ThemeFontSize]
        : (letterSpacing[variant] ?? 0);

  // ── Step 4: Resolve Font Family & Weight ──
  const isNumericWeight =
    typeof weight === "string" &&
    (/^[1-9]00$/.test(weight) || weight === "normal" || weight === "bold");

  const fontStyleWeight: TextStyle["fontWeight"] | undefined =
    fontWeightProp ?? (isNumericWeight ? (weight as TextStyle["fontWeight"]) : undefined);

  const familyWeight: TextWeight | undefined =
    !isNumericWeight && weight ? (weight as TextWeight) : undefined;

  const defaultWeight: TextWeight =
    variant === "largeTitle" || variant === "heading"
      ? "heading"
      : variant === "cardTitle" || variant === "title"
        ? "title"
        : variant === "arabic"
          ? "quran"
          : "regular";

  const selectedWeight: TextWeight = bold
    ? "bold"
    : semiBold
      ? "semiBold"
      : medium
        ? "medium"
        : (familyWeight ?? fontFamilyProp ?? family ?? defaultWeight);

  const resolvedFontFamily = fontFamily[selectedWeight] ?? fontFamily.regular;

  // ── Step 5: Resolve Text Color ──
  // Look up color from theme palette, or allow direct color string (e.g. '#FF0000')
  const resolvedColor =
    color && color in colors
      ? (colors as any)[color]
      : color || colors.text;

  // ── Step 6: Assemble Styles ──
  const baseStyle: TextStyle = {
    color: resolvedColor,
    fontSize: resolvedSize,
    lineHeight: resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    fontFamily: resolvedFontFamily,
    ...(fontStyleWeight ? { fontWeight: fontStyleWeight } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  // ── Step 7: Render Text ──
  return (
    <RNText
      ref={ref}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[baseStyle, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
});

// ─── Exports ──────────────────────────────────────────────────────────────────

// Reanimated-compatible version for animations
export const AnimatedAppText = Animated.createAnimatedComponent(AppText);

export default AppText;
