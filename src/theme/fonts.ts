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
};

export type ThemeFontFamily = typeof fontFamily;
export type ThemeFontWeight = typeof fontWeight;
export type ThemeFontSize = typeof fontSize;
export type ThemeFonts = typeof fonts;
