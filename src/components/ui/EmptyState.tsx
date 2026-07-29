import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { scale } from "react-native-size-matters";

import Button from "@/components/ui/Button";
import { useAppFonts } from "@/hooks/useAppFonts";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeColors } from "@/theme/colors";
import { ThemeSpacing } from "@/theme/spacing";

type BaseProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  animationSource?: any;
  title: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
};

type Props = BaseProps &
  (
    | {
        buttonLabel?: undefined;
        buttonIcon?: undefined;
        onPress?: undefined;
      }
    | {
        buttonLabel: string;
        buttonIcon?: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
      }
  );

export default function EmptyState({
  icon = "folder-open-outline",
  animationSource,
  title,
  subtitle,
  buttonLabel,
  buttonIcon = "arrow-forward",
  onPress,
  style,
}: Props) {
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <View style={[S.container, style]}>
      {animationSource ? (
        <LottieView
          source={animationSource}
          autoPlay
          loop
          style={S.animation}
        />
      ) : (
        <View style={S.iconCircle}>
          <Ionicons name={icon} size={scale(34)} color={colors.primary} />
        </View>
      )}

      <Text style={S.title}>{title}</Text>
      <Text style={S.subtitle}>{subtitle}</Text>

      {buttonLabel && onPress && (
        <Button
          title={buttonLabel}
          icon={buttonIcon}
          onPress={onPress}
          style={S.buttonContainer}
        />
      )}
    </View>
  );
}

type AppFonts = ReturnType<typeof useAppFonts>;

const createStyles = (
  colors: ThemeColors,
  fontFamily: AppFonts["fontFamily"],
  fontSize: AppFonts["fontSize"],
  spacing: ThemeSpacing,
) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.vXxl,
      alignItems: "center",
      gap: spacing.vSm,
    },
    iconCircle: {
      width: scale(68),
      height: scale(68),
      borderRadius: scale(34),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.vSm,
    },
    animation: {
      width: scale(200),
      height: scale(200),
      marginBottom: spacing.vSm,
    },
    title: {
      fontSize: fontSize.title,
      color: colors.text,
      fontFamily: fontFamily.title,
    },
    subtitle: {
      fontSize: fontSize.body,
      color: colors.subtext,
      fontFamily: fontFamily.text,
      textAlign: "center",
      lineHeight: fontSize.body * 1.5,
    },
    buttonContainer: {
      marginTop: spacing.vSm,
      width: "auto",
      alignSelf: "center",
      paddingHorizontal: spacing.xxl,
      borderRadius: scale(30),
    },
  });
