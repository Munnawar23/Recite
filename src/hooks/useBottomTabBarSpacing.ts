import { verticalScale } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";

/**
 * Calculates the required bottom padding / spacer height so the last item
 * in scrollable tab screens rests comfortably above the floating bottom tab bar.
 */
export function useBottomTabBarSpacing(extraPadding: number = verticalScale(16)): number {
  const { bottom } = useAppSafeAreaInsets();
  const barBottom =
    bottom >= 40
      ? bottom + verticalScale(8)
      : bottom > 0
        ? bottom + verticalScale(4)
        : verticalScale(16);
  const barHeight = verticalScale(50);
  return barBottom + barHeight + extraPadding;
}
