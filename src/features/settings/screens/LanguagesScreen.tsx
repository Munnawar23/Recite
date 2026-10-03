import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  AppText,
  Background,
  CommonModal,
  ScreenHeader,
  SectionTitle,
  ReciterList,
} from "@/components";
import { RECITER_OPTIONS } from "@/features/quran-detail/hooks/useQuranAudio";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/i18n";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";

export const RECITER_DROPDOWN_DATA = RECITER_OPTIONS.map((reciter) => ({
  label: reciter.label,
  value: String(reciter.id),
}));

export default function LanguagesScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { colors, fontSize, spacing } = useAppTheme();

  const languageDropdownData = SUPPORTED_LANGUAGES.map((lang) => ({
    label: t(`languages.${lang.code}`, lang.label),
    value: lang.code,
  }));

  const S = createStyles(colors, spacing);

  return (
    <View style={{ flex: 1 }}>
      <Background />
      <ScreenHeader
        title={t("settings.languages.title", "Languages & Audio")}
        subtitle={t(
          "settings.languages.subtitle",
          "App language, translation & reciter",
        )}
        titleFontSize={fontSize.cardTitle - 1}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.scrollContent}
      >
        {/* 1. App Interface Language */}
        <SectionTitle
          label={t("settings.languages.appLanguageSection", "App Language")}
          icon="globe-outline"
          tightSpacing
        />
        <View style={S.card}>
          <AppText variant="bodyLg" family="title" color="text">
            {t("settings.languages.appLanguageTitle", "App Interface Language")}
          </AppText>
          <AppText variant="body" color="subtext" style={S.cardSubtitle}>
            {t(
              "settings.languages.appLanguageSubtitle",
              "Select primary language for menus & interface",
            )}
          </AppText>
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

        {/* 2. Quran Reciter */}
        <SectionTitle
          label={t("settings.languages.quranReciterSection", "Quran Reciter")}
          icon="musical-notes-outline"
          tightSpacing
        />
        <View style={S.card}>
          <AppText variant="bodyLg" family="title" color="text">
            {t("settings.languages.quranReciterTitle", "Default Quran Reciter")}
          </AppText>
          <AppText variant="body" color="subtext" style={S.cardSubtitle}>
            {t(
              "settings.languages.quranReciterSubtitle",
              "Select Qari / Reciter voice for audio playback",
            )}
          </AppText>
          <ReciterList />
        </View>

        <View style={{ height: rs.space(20) }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
) =>
  StyleSheet.create({
    scrollContent: {
      paddingBottom: spacing.vXxl,
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      marginBottom: rs.space(7),
      borderRadius: rs.space(16),
      padding: rs.space(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardSubtitle: {
      marginTop: rs.space(2),
      marginBottom: rs.space(10),
    },
  });
