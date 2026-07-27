import { moderateScale } from "react-native-size-matters";

export const fontFamily = {
  heading: "PlusJakartaSans-Bold",
  title: "Nunito-SemiBold",
  text: "Nunito-Medium",
  quran: "Amiri-Regular",
};

// ─── Semantic Font Sizes (pre-scaled) ────────────────────────────────────
export const fontSize = {
  caption: moderateScale(11), // small labels, captions, badges
  body: moderateScale(13), // main body text, buttons, sub-options
  bodyLg: moderateScale(14), // large body text, surah names
  title: moderateScale(16), // section headers, card titles
  cardTitle: moderateScale(18), // prominent card titles
  heading: moderateScale(16), // main screen titles
  splashTitle: moderateScale(28), // splash / hero display titles
  arabic: moderateScale(24), // quranic arabic verses
};

export type ThemeFontSize = typeof fontSize;
