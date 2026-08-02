import { useAppTheme } from "@/hooks/useAppTheme";
import { useFontStore } from "@/store/fontStore";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

interface BismillahBannerProps {
  chapterId: number;
}

const NO_BISMILLAH = [1, 9];

export default function BismillahBanner({ chapterId }: BismillahBannerProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const { fontSizeScale } = useFontStore();

  let multiplier = 1.0;
  if (fontSizeScale === "small") multiplier = 0.90;
  else if (fontSizeScale === "large") multiplier = 1.12;

  const S = createStyles(fontFamily, fontSize, multiplier);

  if (NO_BISMILLAH.includes(chapterId)) {
    return null;
  }

  const gradientColors = colors.gradient;

  return (
    <View style={S.bismillahContainer}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.bismillahGradient}
      >
        <Text style={S.bismillahText}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>
        <Text style={S.bismillahSub}>
          In the name of Allah, the Most Gracious, the Most Merciful
        </Text>
      </LinearGradient>
    </View>
  );
}

const createStyles = (fontFamily: any, fontSize: any, multiplier: number) =>
  StyleSheet.create({
    bismillahContainer: {
      marginTop: verticalScale(16),
      marginBottom: verticalScale(8),
      borderRadius: scale(16),
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: verticalScale(4) },
      shadowOpacity: 0.15,
      shadowRadius: scale(8),
      elevation: 4,
    },
    bismillahGradient: {
      alignItems: "center",
      paddingVertical: verticalScale(20),
      paddingHorizontal: scale(16),
      gap: verticalScale(8),
      borderRadius: scale(16),
    },
    bismillahText: {
      color: "#FFFFFF",
      fontFamily: fontFamily.quran,
      fontSize: fontSize.splashTitle * multiplier,
      textAlign: "center",
      lineHeight: fontSize.splashTitle * multiplier * 1.8,
    },
    bismillahSub: {
      color: "#E8DFD0",
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg * multiplier,
      textAlign: "center",
      lineHeight: fontSize.bodyLg * multiplier * 1.6,
    },
  });
