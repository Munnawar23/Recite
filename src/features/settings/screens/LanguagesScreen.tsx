import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

import Background from "@/components/layout/Background";
import CommonModal from "@/components/ui/CommonModal";
import ScreenHeader from "@/components/ui/ScreenHeader";
import SectionTitle from "@/components/ui/SectionTitle";

import { ReciterList } from "@/components/ui/ReciterList";
import { RECITER_OPTIONS } from "@/features/quran-detail/hooks/useQuranAudio";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/i18n";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";

export const RECITER_DROPDOWN_DATA = RECITER_OPTIONS.map((reciter) => ({
  label: reciter.label,
  value: String(reciter.id),
}));

export default function LanguagesScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
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
      label: t("settings.languages.translations.hindi", "Hindi (Azizul Haque)"),
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
      label: t("settings.languages.translations.bengali", "Bengali (Taisirul)"),
      value: "161",
    },
  ];

  const languageDropdownData = SUPPORTED_LANGUAGES.map((lang) => ({
    label: t(`languages.${lang.code}`, lang.label),
    value: lang.code,
  }));

  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <View style={{ flex: 1 }}>
      <Background />
      <ScreenHeader
        title={t("settings.languages.title", "Languages & Audio")}
        subtitle={t(
          "settings.languages.subtitle",
          "App language, translation & reciter",
        )}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
      >
        {/* 1. Quran Reciter */}
        <SectionTitle
          label={t("settings.languages.quranReciterSection", "Quran Reciter")}
          icon="musical-notes-outline"
          tightSpacing
        />
        <View style={S.card}>
          <Text style={S.cardTitle}>
            {t("settings.languages.quranReciterTitle", "Default Quran Reciter")}
          </Text>
          <Text style={S.cardSubtitle}>
            {t(
              "settings.languages.quranReciterSubtitle",
              "Select Qari / Reciter voice for audio playback",
            )}
          </Text>
          <ReciterList />
        </View>

        {/* 2. App Interface Language */}
        <SectionTitle
          label={t("settings.languages.appLanguageSection", "App Language")}
          icon="globe-outline"
          tightSpacing
        />
        <View style={S.card}>
          <Text style={S.cardTitle}>
            {t("settings.languages.appLanguageTitle", "App Interface Language")}
          </Text>
          <Text style={S.cardSubtitle}>
            {t(
              "settings.languages.appLanguageSubtitle",
              "Select primary language for menus & interface",
            )}
          </Text>
          <CommonModal
            data={languageDropdownData}
            value={language}
            onChange={(item) => {
              Haptics.medium();
              setLanguage(item.value as SupportedLanguageCode);
            }}
            placeholder={t(
              "settings.languages.appLanguagePlaceholder",
              "Select App Language",
            )}
          />
        </View>

        {/* 3. Quran Translation */}
        <SectionTitle
          label={t(
            "settings.languages.quranTranslationSection",
            "Quran Translation",
          )}
          icon="book-outline"
          tightSpacing
        />
        <View style={S.card}>
          <Text style={S.cardTitle}>
            {t(
              "settings.languages.quranTranslationTitle",
              "Default Quran Translation",
            )}
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

        <View style={{ height: verticalScale(20) }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: spacing.vXxl,
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginBottom: verticalScale(7),
      borderRadius: scale(16),
      padding: scale(14),
      borderWidth: 1,
      borderColor: colors.border,
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
