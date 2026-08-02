import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { scale, verticalScale } from "react-native-size-matters";
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
    <ScrollView style={S.scrollContainer} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={S.introText}>
        {t(
          "settings.about.aboutUsContent",
          "Recite is a non-profit, 100% free community project dedicated to making the Holy Quran accessible to everyone worldwide with zero ads or subscriptions.",
        )}
      </Text>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="heart" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>
            {t("settings.about.featureFreeTitle", "100% Free & Ad-Free")}
          </Text>
          <Text style={S.featureDesc}>
            {t(
              "settings.about.featureFreeDesc",
              "No paywalls, no tracking, and no commercial interruptions.",
            )}
          </Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="headset" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>
            {t("settings.about.featureRecitersTitle", "World-Renowned Reciters")}
          </Text>
          <Text style={S.featureDesc}>
            {t(
              "settings.about.featureRecitersDesc",
              "Listen to high-quality audio recitations from top Qaris.",
            )}
          </Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="globe" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>
            {t("settings.about.featureLanguagesTitle", "Multiple Languages")}
          </Text>
          <Text style={S.featureDesc}>
            {t(
              "settings.about.featureLanguagesDesc",
              "Side-by-side verse translations across global languages.",
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function AboutTheAppContent() {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize);

  return (
    <ScrollView style={S.scrollContainer} contentContainerStyle={S.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={S.introText}>
        {t(
          "settings.about.aboutAppIntro",
          "Recite is built with open-source technologies to deliver a fast, modern, and beautiful Quran experience for everyone.",
        )}
      </Text>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="gift-outline" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>
            {t("settings.about.appFeatureFreeTitle", "100% Free & No Ads")}
          </Text>
          <Text style={S.featureDesc}>
            {t(
              "settings.about.appFeatureFreeDesc",
              "Completely free forever without any ads, popups, or monetization.",
            )}
          </Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="code-slash-outline" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>
            {t("settings.about.appFeatureOpenSourceTitle", "Open Source")}
          </Text>
          <Text style={S.featureDesc}>
            {t(
              "settings.about.appFeatureOpenSourceDesc",
              "Transparent development with community contributions welcomed.",
            )}
          </Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="cloud-download-outline" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>
            {t("settings.about.appFeatureApiTitle", "Quran.com API")}
          </Text>
          <Text style={S.featureDesc}>
            {t(
              "settings.about.appFeatureApiDesc",
              "Powered by official API endpoints from Quran.com for verified authentic verse text & audio.",
            )}
          </Text>
        </View>
      </View>

      <View style={S.featureRow}>
        <View style={S.iconBadge}>
          <Ionicons name="hardware-chip-outline" size={scale(18)} color={colors.primary} />
        </View>
        <View style={S.textWrap}>
          <Text style={S.featureTitle}>
            {t("settings.about.appFeatureExpoTitle", "Built with Expo & React Native")}
          </Text>
          <Text style={S.featureDesc}>
            {t(
              "settings.about.appFeatureExpoDesc",
              "Engineered using Expo and React Native for optimal cross-platform performance.",
            )}
          </Text>
        </View>
      </View>
    </ScrollView>
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

  const handleOpenAboutUs = () => {
    Haptics.medium();
    setInfoModalConfig({
      visible: true,
      title: t("settings.about.aboutUsTitle", "About Us"),
      icon: "heart-outline",
      content: <AboutUsContent />,
    });
  };

  const handleOpenAboutTheApp = () => {
    Haptics.medium();
    setInfoModalConfig({
      visible: true,
      title: t("settings.about.aboutTheAppTitle", "About the App"),
      icon: "information-circle-outline",
      content: <AboutTheAppContent />,
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
        title={t("settings.about.aboutTheAppTitle", "About the App")}
        subtitle={t("settings.about.aboutTheAppSubtitle", "100% free, no ads, open source & Expo")}
        onPress={handleOpenAboutTheApp}
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
    scrollContainer: {
      maxHeight: verticalScale(380),
    },
    scrollContent: {
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
