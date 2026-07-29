import SafeArea from "@/components/layout/SafeArea";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/i18n";
import { triggerInstantTestNotification } from "@/lib/notifications";
import { FontSizeScale } from "@/store/fontStore";
import { useLanguageStore } from "@/store/languageStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ThemeMode } from "@/store/themeStore";

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

const THEME_OPTIONS: {
  mode: ThemeMode;
  txKey: string;
  defaultLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { mode: "light", txKey: "settings.theme.light", defaultLabel: "Light", icon: "sunny-outline" },
  { mode: "dark", txKey: "settings.theme.dark", defaultLabel: "Dark", icon: "moon-outline" },
  { mode: "system", txKey: "settings.theme.system", defaultLabel: "System", icon: "phone-portrait-outline" },
];

const FONT_SIZE_OPTIONS: {
  scale: FontSizeScale;
  txKey: string;
  defaultLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { scale: "small", txKey: "settings.fontSize.small", defaultLabel: "Small", icon: "text-outline" },
  { scale: "default", txKey: "settings.fontSize.default", defaultLabel: "Default", icon: "text" },
  { scale: "large", txKey: "settings.fontSize.large", defaultLabel: "Large", icon: "text-sharp" },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { isNightlyEnabled, toggleNightlyNotification } = useNotificationStore();
  const {
    themeMode,
    setThemeMode,
    fontSizeScale,
    setFontSizeScale,
    colors,
    fontFamily,
    fontSize,
  } = useAppTheme();
  const [triggerCrash, setTriggerCrash] = useState(false);

  if (triggerCrash) {
    throw new Error("Test Crash: Demo of custom ErrorBoundary screen!");
  }

  return (
    <SafeArea>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: fontFamily.heading,
              fontSize: fontSize.heading + 6,
            },
          ]}
        >
          {t("common.settings", "Settings")}
        </Text>

        {/* Notifications Card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.accent}
            />
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.text,
                  fontFamily: fontFamily.title,
                  fontSize: fontSize.title,
                },
              ]}
            >
              {t("settings.notifications.title", "Daily Notifications")}
            </Text>
          </View>

          <Text
            style={[
              styles.cardSubtitle,
              {
                color: colors.subtext,
                fontFamily: fontFamily.text,
                fontSize: fontSize.body,
              },
            ]}
          >
            {t("settings.notifications.subtitle", "Receive a nightly Quran reading reminder at 10:00 PM.")}
          </Text>

          {/* 1. Toggle Switch Row */}
          <View
            style={[
              styles.toggleRow,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <View style={styles.toggleRowTextContainer}>
              <Text
                style={[
                  styles.toggleLabel,
                  {
                    color: colors.text,
                    fontFamily: fontFamily.title,
                    fontSize: fontSize.body,
                  },
                ]}
              >
                {t("settings.notifications.nightlyToggle", "Daily 10 PM Reminder")}
              </Text>
              <Text
                style={[
                  styles.toggleSublabel,
                  {
                    color: colors.subtext,
                    fontFamily: fontFamily.text,
                    fontSize: fontSize.caption,
                  },
                ]}
              >
                {isNightlyEnabled
                  ? t("settings.notifications.enabledStatus", "Scheduled for 10:00 PM every day")
                  : t("settings.notifications.disabledStatus", "Disabled")}
              </Text>
            </View>

            <Switch
              value={isNightlyEnabled}
              onValueChange={(val) => {
                toggleNightlyNotification(val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.card}
            />
          </View>

          {/* 2. Instant Test Notification Button */}
          <Pressable
            onPress={() => triggerInstantTestNotification()}
            style={[
              styles.testButton,
              { backgroundColor: colors.accent, marginTop: verticalScale(12) },
            ]}
          >
            <Ionicons name="notifications-sharp" size={16} color={colors.card} />
            <Text
              style={[
                styles.testButtonText,
                {
                  color: colors.card,
                  fontFamily: fontFamily.title,
                  fontSize: fontSize.body,
                },
              ]}
            >
              {t("settings.notifications.testButton", "Test Notification Now")}
            </Text>
          </Pressable>
        </View>

        {/* Language Selection Card */}
        <View
          style={[
            styles.card,
            styles.cardSpacing,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons
              name="language-outline"
              size={20}
              color={colors.accent}
            />
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.text,
                  fontFamily: fontFamily.title,
                  fontSize: fontSize.title,
                },
              ]}
            >
              {t("settings.language.title", "App Language")}
            </Text>
          </View>

          <Text
            style={[
              styles.cardSubtitle,
              {
                color: colors.subtext,
                fontFamily: fontFamily.text,
                fontSize: fontSize.body,
              },
            ]}
          >
            {t("settings.language.subtitle", "Choose your preferred language for the application interface.")}
          </Text>

          <View style={styles.languageGrid}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(lang.code as SupportedLanguageCode)}
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.background,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                  isSelected && {
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
              >
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={isSelected ? colors.card : colors.subtext}
                />
                <Text
                  style={[
                    styles.languageOptionText,
                    {
                      color: isSelected ? colors.card : colors.text,
                      fontFamily: isSelected
                        ? fontFamily.title
                        : fontFamily.text,
                      fontSize: fontSize.body,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {lang.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Theme Selection Card */}
      <View
        style={[
          styles.card,
          styles.cardSpacing,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name="color-palette-outline"
            size={20}
            color={colors.accent}
          />
          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.text,
                fontFamily: fontFamily.title,
                fontSize: fontSize.title,
              },
            ]}
          >
            {t("settings.theme.title", "App Theme")}
          </Text>
        </View>

        <Text
          style={[
            styles.cardSubtitle,
            {
              color: colors.subtext,
              fontFamily: fontFamily.text,
              fontSize: fontSize.body,
            },
          ]}
        >
          {t("settings.theme.subtitle", "Choose your preferred appearance or sync with system settings.")}
        </Text>

        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          {THEME_OPTIONS.map((option) => {
            const isSelected = themeMode === option.mode;
            return (
              <Pressable
                key={option.mode}
                onPress={() => setThemeMode(option.mode)}
                style={[
                  styles.segmentButton,
                  isSelected && {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={16}
                  color={isSelected ? colors.card : colors.subtext}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isSelected ? colors.card : colors.text,
                      fontFamily: isSelected
                        ? fontFamily.title
                        : fontFamily.text,
                      fontSize: fontSize.body,
                    },
                  ]}
                >
                  {t(option.txKey, option.defaultLabel)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Font Size Selection Card */}
      <View
        style={[
          styles.card,
          styles.cardSpacing,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="text-outline" size={20} color={colors.accent} />
          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.text,
                fontFamily: fontFamily.title,
                fontSize: fontSize.title,
              },
            ]}
          >
            {t("settings.fontSize.title", "Text Size")}
          </Text>
        </View>

        <Text
          style={[
            styles.cardSubtitle,
            {
              color: colors.subtext,
              fontFamily: fontFamily.text,
              fontSize: fontSize.body,
            },
          ]}
        >
          {t("settings.fontSize.subtitle", "Adjust the reading font size across the entire application.")}
        </Text>

        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          {FONT_SIZE_OPTIONS.map((option) => {
            const isSelected = fontSizeScale === option.scale;
            return (
              <Pressable
                key={option.scale}
                onPress={() => setFontSizeScale(option.scale)}
                style={[
                  styles.segmentButton,
                  isSelected && {
                    backgroundColor: colors.accent,
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={
                    option.scale === "small"
                      ? 14
                      : option.scale === "default"
                        ? 16
                        : 18
                  }
                  color={isSelected ? colors.card : colors.subtext}
                />
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isSelected ? colors.card : colors.text,
                      fontFamily: isSelected
                        ? fontFamily.title
                        : fontFamily.text,
                      fontSize: fontSize.body,
                    },
                  ]}
                >
                  {t(option.txKey, option.defaultLabel)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Live Font & Color Preview Box */}
        <View
          style={[
            styles.previewContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          {/* 1. Heading - Plus Jakarta Sans */}
          <Text style={[styles.previewText, { fontFamily: fontFamily.heading, color: colors.text, fontSize: fontSize.heading }]}>
            heading: Plus Jakarta Sans (Bold)
          </Text>

          {/* 2. Title - Nunito SemiBold */}
          <Text style={[styles.previewText, { fontFamily: fontFamily.title, color: colors.accent, fontSize: fontSize.title }]}>
            title: Nunito SemiBold
          </Text>

          {/* 3. Text - Nunito Medium */}
          <Text style={[styles.previewText, { fontFamily: fontFamily.text, color: colors.subtext, fontSize: fontSize.body }]}>
            text: Nunito Medium
          </Text>

          {/* 4. Quran - Amiri Regular */}
          <Text style={[styles.previewText, { fontFamily: fontFamily.quran, color: colors.text, fontSize: fontSize.arabic, textAlign: "right" }]}>
            quran: بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </Text>
        </View>
      </View>

      {/* Test Error Boundary Button */}
      <View
        style={[
          styles.card,
          styles.cardSpacing,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="bug-outline" size={20} color="#E53E3E" />
          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.text,
                fontFamily: fontFamily.title,
                fontSize: fontSize.title,
              },
            ]}
          >
            {t("settings.errorTest.title", "Error Boundary Test")}
          </Text>
        </View>

        <Text
          style={[
            styles.cardSubtitle,
            {
              color: colors.subtext,
              fontFamily: fontFamily.text,
              fontSize: fontSize.body,
            },
          ]}
        >
          {t("settings.errorTest.subtitle", "Test how the app handles unexpected errors gracefully.")}
        </Text>

        <Pressable
          onPress={() => setTriggerCrash(true)}
          style={[styles.testButton, { backgroundColor: "#E53E3E" }]}
        >
          <Ionicons name="warning-outline" size={16} color="#FFFFFF" />
          <Text
            style={[
              styles.testButtonText,
              {
                color: "#FFFFFF",
                fontFamily: fontFamily.title,
                fontSize: fontSize.body,
              },
            ]}
          >
            {t("settings.errorTest.button", "Simulate App Crash")}
          </Text>
        </Pressable>
      </View>
      </ScrollView>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(16),
  },
  headerTitle: {
    marginBottom: verticalScale(20),
  },
  card: {
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16),
  },
  cardSpacing: {
    marginTop: verticalScale(16),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: verticalScale(4),
  },
  cardTitle: {},
  cardSubtitle: {
    marginBottom: verticalScale(16),
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: scale(12),
    borderWidth: 1,
    padding: scale(4),
    gap: scale(4),
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(10),
    borderRadius: scale(8),
    gap: scale(6),
  },
  segmentText: {},
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8),
  },
  languageOption: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderRadius: scale(10),
    borderWidth: 1,
    gap: scale(8),
  },
  languageOptionText: {},
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(10),
    borderRadius: scale(10),
    gap: scale(6),
  },
  testButtonText: {},
  previewContainer: {
    marginTop: verticalScale(14),
    padding: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    gap: verticalScale(10),
  },
  previewText: {
    lineHeight: verticalScale(24),
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
  },
  toggleRowTextContainer: {
    flex: 1,
    paddingRight: scale(12),
  },
  toggleLabel: {},
  toggleSublabel: {
    marginTop: verticalScale(2),
  },
});
