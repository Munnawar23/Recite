import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import React from "react";
import { useTranslation } from "react-i18next";

export default function StorageSection() {
  const { t } = useTranslation();

  return (
    <>
      <SectionTitle
        label={t("settings.sections.storage", "Storage")}
        icon="server-outline"
        tightSpacing
      />
      <SettingsItemCard
        icon="cloud-offline-outline"
        iconColor="#E53E3E"
        title={t("settings.storage.clearDownloadsTitle", "Clear All Downloads")}
        subtitle={t("settings.storage.clearDownloadsSubtitleEmpty", "0 Surah(s) saved offline (0 MB)")}
      />
      <SettingsItemCard
        icon="heart-dislike-outline"
        iconColor="#E53E3E"
        title={t("settings.storage.clearFavoritesTitle", "Clear All Favorites")}
        subtitle={t(
          "settings.storage.clearFavoritesSubtitle",
          "0 Surah(s) saved in favorites",
        )}
      />
    </>
  );
}
