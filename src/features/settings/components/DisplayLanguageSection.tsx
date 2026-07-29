import React from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import { Haptics } from "@/lib/haptics";

export default function DisplayLanguageSection() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <SectionTitle label={t("settings.sections.displayLanguage", "Display & Languages")} icon="color-palette-outline" tightSpacing />
      
      {/* 1. Display Options */}
      <SettingsItemCard
        icon="color-palette-outline"
        title={t("settings.display.optionsTitle", "Display Options")}
        subtitle={t("settings.display.optionsSubtitle", "Theme & font sizes")}
        onPress={() => {
          Haptics.medium();
          router.push("/settings/display");
        }}
      />

      {/* 2. Language & Audio Options */}
      <SettingsItemCard
        icon="globe-outline"
        title={t("settings.languages.optionsTitle", "Language & Audio Options")}
        subtitle={t("settings.languages.optionsSubtitle", "Language, translation & reciter")}
        onPress={() => {
          Haptics.medium();
          router.push("/settings/languages");
        }}
      />
    </>
  );
}
