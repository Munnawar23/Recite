import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale } from "react-native-size-matters";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import CommonModal from "@/components/ui/CommonModal";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";

function AboutUsContent() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize);

  return (
    <View style={S.container}>
      <Text style={S.introText}>
        {t("settings.about.aboutUsContent", "Recite is a non-profit, 100% free community project dedicated to making the Holy Quran accessible to everyone worldwide with zero ads or subscriptions.")}
      </Text>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="heart" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>{t("settings.about.featureFreeTitle", "100% Free & Ad-Free")}</Text>
          <Text style={S.featureDesc}>{t("settings.about.featureFreeDesc", "No paywalls, no tracking, and no commercial interruptions.")}</Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="headset" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>{t("settings.about.featureRecitersTitle", "World-Renowned Reciters")}</Text>
          <Text style={S.featureDesc}>{t("settings.about.featureRecitersDesc", "Listen to high-quality audio recitations from top Qaris.")}</Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="globe" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>{t("settings.about.featureLanguagesTitle", "Multiple Languages")}</Text>
          <Text style={S.featureDesc}>{t("settings.about.featureLanguagesDesc", "Side-by-side verse translations across global languages.")}</Text>
        </View>
      </View>
    </View>
  );
}

function AboutAppContent() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize } = useAppTheme();
  const appName = Constants.expoConfig?.name || "Recite";
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const S = createStyles(colors, fontFamily, fontSize);

  return (
    <View style={S.container}>
      <View style={S.heroHeader}>
        <View style={S.heroBadge}>
          <Ionicons name="book" size={scale(28)} color={colors.primary} />
        </View>
        <Text style={S.appName}>{appName}</Text>
        <Text style={S.appTagline}>{t("settings.about.tagline", "Read, Listen & Reflect upon the Quran")}</Text>
        <View style={S.versionBadge}>
          <Text style={S.versionText}>{t("settings.about.appVersionSubtitle", "Version {{version}}", { version: appVersion })}</Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="information-circle" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>{t("settings.about.appVersionTitle", "App Version")}</Text>
          <Text style={S.featureDesc}>{`${appName} v${appVersion}`}</Text>
        </View>
      </View>
    </View>
  );
}

export default function AboutSection() {
  const { t } = useTranslation();
  const [infoModalConfig, setInfoModalConfig] = useState<{
    visible: boolean;
    title: string;
    icon?: keyof typeof Ionicons.glyphMap;
    content: React.ReactNode;
  }>({
    visible: false,
    title: "",
    content: null,
  });

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleOpenAboutUs = () => {
    Haptics.medium();
    setInfoModalConfig({
      visible: true,
      title: t("settings.about.aboutUsTitle", "About Us"),
      icon: "heart-outline",
      content: <AboutUsContent />,
    });
  };

  const handleOpenAboutApp = () => {
    Haptics.medium();
    setInfoModalConfig({
      visible: true,
      title: t("settings.about.appVersionTitle", "App Version"),
      icon: "information-circle-outline",
      content: <AboutAppContent />,
    });
  };

  return (
    <>
      <SectionTitle label={t("settings.sections.aboutUs", "About Us")} icon="people-outline" tightSpacing />
      <SettingsItemCard
        icon="heart-outline"
        title={t("settings.about.aboutUsTitle", "About Us")}
        subtitle={t("settings.about.subtitle", "Free community Quran app")}
        onPress={handleOpenAboutUs}
      />
      <SettingsItemCard
        icon="information-circle-outline"
        title={t("settings.about.appVersionTitle", "App Version")}
        subtitle={t("settings.about.appVersionSubtitle", "Version {{version}}", { version: appVersion })}
        onPress={handleOpenAboutApp}
      />

      <CommonModal
        visible={infoModalConfig.visible}
        title={infoModalConfig.title}
        icon={infoModalConfig.icon}
        onClose={() => setInfoModalConfig((prev) => ({ ...prev, visible: false }))}
      >
        {infoModalConfig.content}
      </CommonModal>
    </>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any) =>
  StyleSheet.create({
    container: {
      gap: verticalScale(12),
      paddingVertical: verticalScale(4),
    },
    introText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
      color: colors.text,
      lineHeight: fontSize.bodyLg * 1.45,
      marginBottom: verticalScale(6),
    },
    heroHeader: {
      alignItems: "center",
      marginBottom: verticalScale(8),
    },
    heroBadge: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(16),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(8),
    },
    appName: {
      fontFamily: fontFamily.heading,
      fontSize: fontSize.splashTitle,
      color: colors.primary,
    },
    appTagline: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: colors.subtext,
      marginTop: verticalScale(4),
      textAlign: "center",
    },
    versionBadge: {
      backgroundColor: colors.primary + "18",
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(4),
      borderRadius: scale(20),
      marginTop: verticalScale(8),
    },
    versionText: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
      color: colors.primary,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: scale(12),
      backgroundColor: colors.primary + "0A",
      padding: scale(12),
      borderRadius: scale(12),
    },
    iconBadge: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(10),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      marginTop: verticalScale(2),
    },
    textWrap: {
      flex: 1,
    },
    featureTitle: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      color: colors.text,
    },
    featureDesc: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: colors.subtext,
      marginTop: verticalScale(2),
      lineHeight: fontSize.body * 1.35,
    },
  });
