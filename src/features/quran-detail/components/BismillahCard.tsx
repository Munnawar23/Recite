import { AppText } from "@/components";
import { DEFAULT_TRANSLATION_ID_STRING, getBismillahTranslation } from "@/constants";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useFontStore } from "@/store/fontStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

export interface BismillahCardProps {
  chapterId: number;
  selectedTransId?: string;
}

const NO_BISMILLAH = [1, 9];

export default function BismillahCard({
  chapterId,
  selectedTransId,
}: BismillahCardProps) {
  const { colors, fontSize } = useAppTheme();
  const { fontSizeScale } = useFontStore();
  const storeTransId = useQuranSettingsStore((state) => state.translationId);

  const activeTransId =
    selectedTransId ?? storeTransId ?? DEFAULT_TRANSLATION_ID_STRING;

  let multiplier = 1.0;
  if (fontSizeScale === "small") multiplier = 0.9;
  else if (fontSizeScale === "large") multiplier = 1.12;

  if (NO_BISMILLAH.includes(chapterId)) {
    return null;
  }

  const gradientColors = colors.gradient;
  const translationText = getBismillahTranslation(activeTransId);

  return (
    <View style={S.bismillahContainer}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={S.bismillahGradient}
      >
        <AppText
          family="quran"
          align="center"
          color="#FFFFFF"
          size={fontSize.splashTitle * multiplier}
          lineHeight={fontSize.splashTitle * multiplier * 1.8}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </AppText>
        {activeTransId !== "0" && Boolean(translationText) ? (
          <AppText
            semiBold
            align="center"
            color="rgba(255, 255, 255, 0.95)"
            size={fontSize.bodyLg * multiplier}
            lineHeight={fontSize.bodyLg * multiplier * 1.6}
          >
            {translationText}
          </AppText>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const S = StyleSheet.create({
  bismillahContainer: {
    marginTop: rs.space(16),
    marginBottom: rs.space(8),
    borderRadius: rs.space(16),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: rs.space(4) },
    shadowOpacity: 0.15,
    shadowRadius: rs.space(8),
    elevation: 4,
  },
  bismillahGradient: {
    alignItems: "center",
    paddingVertical: rs.space(20),
    paddingHorizontal: rs.space(16),
    gap: rs.space(8),
    borderRadius: rs.space(16),
  },
});
