import { scale, verticalScale } from "react-native-size-matters";

export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),

  vXs: verticalScale(4),
  vSm: verticalScale(8),
  vMd: verticalScale(12),
  vLg: verticalScale(16),
  vXl: verticalScale(20),
  vXxl: verticalScale(24),
  vXxxl: verticalScale(32),

  // Semantic layout tokens
  screenPadding: scale(16),
  sectionHeaderTop: verticalScale(16),
  sectionHeaderBottom: verticalScale(10),
  cardMarginTop: verticalScale(6),
  cardMarginBottom: verticalScale(16),
  itemGap: scale(8),
};

export type ThemeSpacing = typeof spacing;
