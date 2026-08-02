import { moderateScale } from "react-native-size-matters";

export const fontFamily = {
  heading: "PlusJakartaSans-Bold",
  title: "Nunito-SemiBold",
  text: "Nunito-Medium",
  quran: "Amiri-Bold",
};

// ─── Semantic Font Sizes (pre-scaled) ────────────────────────────────────
export const fontSize = {
  caption: moderateScale(12), // small labels, captions, badges
  body: moderateScale(14), // main body text, buttons, sub-options
  bodyLg: moderateScale(15), // large body text, surah names
  title: moderateScale(17), // section headers, card titles
  cardTitle: moderateScale(19), // prominent card titles
  heading: moderateScale(17), // main screen titles
  splashTitle: moderateScale(29), // splash / hero display titles
  arabic: moderateScale(27), // quranic arabic verses
};

export type ThemeFontSize = typeof fontSize;
