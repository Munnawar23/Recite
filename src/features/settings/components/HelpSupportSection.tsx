import React from "react";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { SectionTitle } from "@/components";
import { SUPPORT_EMAIL } from "@/constants";
import SettingsItemCard from "./SettingsItemCard";
import { Haptics } from "@/lib/haptics";

export default function HelpSupportSection() {
  const { t } = useTranslation();

  const handleHelpSupport = () => {
    Haptics.light();
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Recite%20App%20Feedback%20%26%20Support`);
  };

  return (
    <>
      <SectionTitle label={t("settings.helpSupport.title", "Help & Support")} icon="help-circle-outline" tightSpacing />
      <SettingsItemCard
        icon="mail-outline"
        title={t("settings.helpSupport.contactTitle", "Contact Support")}
        subtitle={t("settings.helpSupport.contactEmail", SUPPORT_EMAIL)}
        onPress={handleHelpSupport}
      />
    </>
  );
}
