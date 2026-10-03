import { rs } from "@/helpers/responsiveHelper";

export const fontFamily = {
  regular: "Nunito-Medium",
  medium: "Nunito-Medium",
  semiBold: "Nunito-SemiBold",
  bold: "PlusJakartaSans-Bold",
  heading: "PlusJakartaSans-Bold",
  title: "Nunito-SemiBold",
  text: "Nunito-Medium",
  quran: "Amiri-Bold",
  quranBold: "Amiri-Bold",
};

export const fontSize = {
  caption: rs.font(12),
  bodySm: rs.font(13),
  body: rs.font(14),
  bodyLg: rs.font(15),
  title: rs.font(17),
  cardTitle: rs.font(19),
  heading: rs.font(18),
  largeTitle: rs.font(28),
  splashTitle: rs.font(29),
  arabic: rs.font(27),
};

export const lineHeight = {
  caption: Math.round(rs.font(12) * 1.35),
  bodySm: Math.round(rs.font(13) * 1.35),
  body: Math.round(rs.font(14) * 1.35),
  bodyLg: Math.round(rs.font(15) * 1.55),
  title: Math.round(rs.font(17) * 1.35),
  cardTitle: Math.round(rs.font(19) * 1.35),
  heading: Math.round(rs.font(18) * 1.35),
  largeTitle: Math.round(rs.font(28) * 1.35),
  splashTitle: Math.round(rs.font(29) * 1.35),
  arabic: Math.round(rs.font(27) * 2.05),
};

export const letterSpacing = {
  caption: 0.2,
  bodySm: 0.1,
  body: 0,
  bodyLg: 0,
  title: 0.15,
  cardTitle: 0.15,
  heading: 0.2,
  largeTitle: 0.25,
  splashTitle: 0.2,
  arabic: 0,
};

export const fontWeight = {
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
  heading: "700",
  title: "600",
  text: "500",
  quran: "700",
  quranBold: "700",
} as const;

export const fonts = {
  family: fontFamily,
  weight: fontWeight,
  size: fontSize,
  lineHeight,
  letterSpacing,
};

export type ThemeFontFamily = typeof fontFamily;
export type ThemeFontWeight = typeof fontWeight;
export type ThemeFontSize = typeof fontSize;
export type ThemeLineHeight = typeof lineHeight;
export type ThemeLetterSpacing = typeof letterSpacing;
export type ThemeFonts = typeof fonts;
