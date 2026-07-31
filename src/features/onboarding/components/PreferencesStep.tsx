import CommonModal from "@/components/ui/CommonModal";
import { RECITER_OPTIONS } from "@/features/quran/hooks/useQuranAudio";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

const RECITER_DROPDOWN_DATA = RECITER_OPTIONS.map((reciter) => ({
  label: reciter.label,
  value: String(reciter.id),
}));

interface PreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PreferencesStep({ onNext, onBack }: PreferencesStepProps) {
  const { t } = useTranslation();
  const { translationId, setTranslationId, reciterId, setReciterId } =
    useQuranSettingsStore();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();

  const translationOptions = [
    {
      label: t("settings.languages.translations.arabicOnly", "Arabic Only"),
      value: "0",
    },
    {
      label: t("settings.languages.translations.english", "English (Saheeh)"),
      value: "20",
    },
    {
      label: t("settings.languages.translations.urdu", "Urdu (Maududi)"),
      value: "97",
    },
    {
      label: t(
        "settings.languages.translations.hindi",
        "Hindi (Azizul Haque)",
      ),
      value: "122",
    },
    {
      label: t(
        "settings.languages.translations.indonesian",
        "Indonesian (Ministry)",
      ),
      value: "33",
    },
    {
      label: t(
        "settings.languages.translations.bengali",
        "Bengali (Taisirul)",
      ),
      value: "161",
    },
  ];

  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <OnboardingStepWrapper
      step={2}
      title={t("onboarding.preferences.title", "Quran Preferences")}
      subtitle={t(
        "onboarding.preferences.subtitle",
        "Choose your default Quran translation and the reciter voice for audio.",
      )}
      icon="book-outline"
      onPrimary={onNext}
      onBack={onBack}
      showSkip={false}
    >
      {/* Translation card */}
      <View style={S.card}>
        <Text style={S.cardTitle}>
          {t("onboarding.preferences.translationLabel", "Quran Translation")}
        </Text>
        <Text style={S.cardSubtitle}>
          {t(
            "settings.languages.quranTranslationSubtitle",
            "Select translation text displayed for verses",
          )}
        </Text>
        <CommonModal
          data={translationOptions}
          value={translationId}
          onChange={(item) => {
            Haptics.medium();
            setTranslationId(item.value);
          }}
          placeholder={t(
            "settings.languages.quranTranslationPlaceholder",
            "Select Translation",
          )}
        />
      </View>

      {/* Reciter card */}
      <View style={S.card}>
        <Text style={S.cardTitle}>
          {t("onboarding.preferences.reciterLabel", "Quran Reciter")}
        </Text>
        <Text style={S.cardSubtitle}>
          {t(
            "settings.languages.quranReciterSubtitle",
            "Select Qari / Reciter voice for audio playback",
          )}
        </Text>
        <CommonModal
          data={RECITER_DROPDOWN_DATA}
          value={String(reciterId)}
          onChange={(item) => {
            Haptics.medium();
            setReciterId(parseInt(item.value, 10));
          }}
          placeholder={t(
            "settings.languages.quranReciterPlaceholder",
            "Select Reciter",
          )}
        />
      </View>
    </OnboardingStepWrapper>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, spacing: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: scale(16),
      padding: scale(14),
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: verticalScale(7),
    },
    cardTitle: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      color: colors.text,
    },
    cardSubtitle: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: colors.subtext,
      marginTop: verticalScale(2),
      marginBottom: verticalScale(10),
    },
  });

export default PreferencesStep;
