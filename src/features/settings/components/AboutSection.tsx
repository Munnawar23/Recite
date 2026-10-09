import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { SectionTitle } from "@/components";
import SettingsItemCard from "./SettingsItemCard";
import { Haptics } from "@/lib/haptics";

export default function AboutSection() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleOpenAbout = () => {
    Haptics.light();
    router.push("/settings/about");
  };

  return (
    <>
      <SectionTitle label={t("settings.sections.aboutUs", "About Us")} icon="people-outline" tightSpacing />
      <SettingsItemCard
        icon="heart-outline"
        title={t("settings.about.aboutUsTitle", "About Us")}
        subtitle={t("settings.about.subtitle", "App info & technology")}
        onPress={handleOpenAbout}
      />
    </>
  );
}
