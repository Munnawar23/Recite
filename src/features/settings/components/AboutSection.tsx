import React from "react";
import { Alert, Share } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { SectionTitle } from "@/components";
import { PLAY_STORE_URL } from "@/constants";
import SettingsItemCard from "./SettingsItemCard";
import { Haptics } from "@/lib/haptics";

export default function AboutSection() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleOpenAbout = () => {
    Haptics.light();
    router.push("/settings/about");
  };

  const handleShareApp = async () => {
    try {
      const shareMessage = `${t(
        "settings.share.message",
        "Check out Recite app to read and listen to the Holy Quran! Download it here:",
      )}\n${PLAY_STORE_URL}`;

      await Share.share(
        {
          message: shareMessage,
          url: PLAY_STORE_URL,
          title: t("settings.share.title", "Share App"),
        },
        {
          dialogTitle: t("settings.share.dialogTitle", "Share Recite via"),
        },
      );
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(t("common.error", "Error"), error.message);
      }
    }
  };

  return (
    <>
      <SectionTitle
        label={t("settings.sections.aboutUs", "About Us")}
        icon="people-outline"
        tightSpacing
      />
      <SettingsItemCard
        icon="heart-outline"
        title={t("settings.about.aboutUsTitle", "About Us")}
        subtitle={t("settings.about.subtitle", "App info & technology")}
        onPress={handleOpenAbout}
      />
      <SettingsItemCard
        icon="share-social-outline"
        title={t("settings.share.title", "Share App")}
        subtitle={t(
          "settings.share.subtitle",
          "Share with friends & family",
        )}
        onPress={handleShareApp}
      />
    </>
  );
}
