import { ReciterList } from "@/features/quran/components/ReciterList";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet } from "react-native";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface TranslationStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Translation({ onNext, onBack }: TranslationStepProps) {
  const { t } = useTranslation();
  const { setTranslationId } = useQuranSettingsStore();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();

  useEffect(() => {
    // Ensure default translation is English ("20")
    setTranslationId("20");
  }, [setTranslationId]);

  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <OnboardingStepWrapper
      step={2}
      title={t("onboarding.preferences.title", "Choose Quran Reciter")}
      subtitle={t(
        "onboarding.preferences.subtitle",
        "Select your preferred Qari / Reciter voice for Quran audio playback.",
      )}
      icon="headset-outline"
      onPrimary={onNext}
      onBack={onBack}
      showSkip={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.listContainer}
      >
        <ReciterList />
      </ScrollView>
    </OnboardingStepWrapper>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    listContainer: {
      paddingBottom: spacing.cardMarginBottom,
    },
  });

export default Translation;
