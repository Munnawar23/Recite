import React from "react";
import { Alert, Linking, Share } from "react-native";
import { useTranslation } from "react-i18next";
import { SectionTitle } from "@/components";
import { PLAY_STORE_MARKET_URL, PLAY_STORE_URL } from "@/constants";
import SettingsItemCard from "./SettingsItemCard";
import { Haptics } from "@/lib/haptics";

export default function ShareRateSection() {
  const { t } = useTranslation();

  const handleRateApp = async () => {
    Haptics.light();
    try {
      const supported = await Linking.canOpenURL(PLAY_STORE_MARKET_URL);
      if (supported) {
        await Linking.openURL(PLAY_STORE_MARKET_URL);
      } else {
        await Linking.openURL(PLAY_STORE_URL);
      }
    } catch {
      await Linking.openURL(PLAY_STORE_URL);
    }
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
        label={t("settings.sections.shareRate", "Share & Rate")}
        icon="heart-outline"
        tightSpacing
      />
      <SettingsItemCard
        icon="star-outline"
        title={t("settings.rate.title", "Rate App")}
        subtitle={t(
          "settings.rate.subtitle",
          "Support us on Google Play",
        )}
        onPress={handleRateApp}
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
