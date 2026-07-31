import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { ThemeMode, useThemeStore } from "@/store/themeStore";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

interface ThemePhonePickerProps {
  showHorizontalPadding?: boolean;
}

export function ThemePhonePicker({ showHorizontalPadding = true }: ThemePhonePickerProps) {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();

  const S = createStyles(colors, fontFamily, fontSize, spacing, showHorizontalPadding);

  const themeOptions: { key: ThemeMode; label: string }[] = [
    { key: "light", label: t("settings.display.theme.light", "Light") },
    { key: "dark", label: t("settings.display.theme.dark", "Dark") },
    { key: "system", label: t("settings.display.theme.system", "System") },
  ];

  return (
    <View style={S.phoneCardsRow}>
      {themeOptions.map((opt) => {
        const isSelected = themeMode === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              S.phoneCardContainer,
              isSelected && S.phoneCardSelected,
            ]}
            onPress={() => {
              Haptics.medium();
              setThemeMode(opt.key);
            }}
            activeOpacity={0.8}
          >
            {/* Top Radio Indicator */}
            <View style={S.radioOuter}>
              {isSelected && <View style={S.radioInner} />}
            </View>

            {/* Phone Frame Mockup */}
            <View style={[S.phoneFrame, getPhoneFrameBg(opt.key)]}>
              {opt.key === "light" && <LightPhoneMockup />}
              {opt.key === "dark" && <DarkPhoneMockup />}
              {opt.key === "system" && <SystemPhoneMockup />}
            </View>

            {/* Card Title Label */}
            <Text style={[S.phoneCardLabel, isSelected && S.phoneCardLabelSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function getPhoneFrameBg(mode: ThemeMode) {
  if (mode === "light") return { backgroundColor: "#1A2228" };
  if (mode === "dark") return { backgroundColor: "#10161A" };
  return { backgroundColor: "#141C20" };
}

function LightPhoneMockup() {
  return (
    <View style={mockStyles.lightBody}>
      <View style={mockStyles.lightHeader} />
      <View style={mockStyles.lightBanner} />
      <View style={mockStyles.lightCard} />
      <View style={mockStyles.gridRow}>
        <View style={mockStyles.lightBox} />
        <View style={mockStyles.lightBox} />
        <View style={mockStyles.lightBox} />
      </View>
      <View style={mockStyles.lightNav} />
    </View>
  );
}

function DarkPhoneMockup() {
  return (
    <View style={mockStyles.darkBody}>
      <View style={mockStyles.darkHeader} />
      <View style={mockStyles.darkBanner} />
      <View style={mockStyles.darkCard} />
      <View style={mockStyles.gridRow}>
        <View style={mockStyles.darkBox} />
        <View style={mockStyles.darkBox} />
        <View style={mockStyles.darkBox} />
      </View>
      <View style={mockStyles.darkNav} />
    </View>
  );
}

function SystemPhoneMockup() {
  return (
    <View style={mockStyles.systemContainer}>
      <View style={mockStyles.splitLeft}>
        <View style={mockStyles.lightHeader} />
        <View style={mockStyles.lightBanner} />
        <View style={mockStyles.lightCard} />
        <View style={mockStyles.gridRow}>
          <View style={mockStyles.lightBox} />
        </View>
        <View style={mockStyles.lightNav} />
      </View>
      <View style={mockStyles.splitRight}>
        <View style={mockStyles.darkHeader} />
        <View style={mockStyles.darkBanner} />
        <View style={mockStyles.darkCard} />
        <View style={mockStyles.gridRow}>
          <View style={mockStyles.darkBox} />
        </View>
        <View style={mockStyles.darkNav} />
      </View>
    </View>
  );
}

const mockStyles = StyleSheet.create({
  lightBody: {
    flex: 1,
    backgroundColor: "#F2E9DD",
    borderRadius: scale(10),
    padding: scale(6),
    gap: verticalScale(4),
  },
  lightHeader: {
    height: verticalScale(6),
    width: "40%",
    backgroundColor: "#3F7A5C",
    borderRadius: scale(3),
  },
  lightBanner: {
    height: verticalScale(20),
    backgroundColor: "#3F7A5C",
    borderRadius: scale(6),
    opacity: 0.85,
  },
  lightCard: {
    height: verticalScale(12),
    backgroundColor: "#FAF4EC",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#E3D5C1",
  },
  lightBox: {
    flex: 1,
    height: verticalScale(18),
    backgroundColor: "#FAF4EC",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#E3D5C1",
  },
  lightNav: {
    height: verticalScale(10),
    backgroundColor: "#E3D5C1",
    borderRadius: scale(3),
    marginTop: "auto",
  },
  darkBody: {
    flex: 1,
    backgroundColor: "#121415",
    borderRadius: scale(10),
    padding: scale(6),
    gap: verticalScale(4),
  },
  darkHeader: {
    height: verticalScale(6),
    width: "40%",
    backgroundColor: "#D4A86A",
    borderRadius: scale(3),
  },
  darkBanner: {
    height: verticalScale(20),
    backgroundColor: "#192223",
    borderRadius: scale(6),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkCard: {
    height: verticalScale(12),
    backgroundColor: "#192223",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkBox: {
    flex: 1,
    height: verticalScale(18),
    backgroundColor: "#192223",
    borderRadius: scale(4),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkNav: {
    height: verticalScale(10),
    backgroundColor: "#1E2B2C",
    borderRadius: scale(3),
    marginTop: "auto",
  },
  systemContainer: {
    flex: 1,
    flexDirection: "row",
    borderRadius: scale(10),
    overflow: "hidden",
  },
  splitLeft: {
    flex: 1,
    backgroundColor: "#F2E9DD",
    padding: scale(6),
    gap: verticalScale(4),
  },
  splitRight: {
    flex: 1,
    backgroundColor: "#121415",
    padding: scale(6),
    gap: verticalScale(4),
  },
  gridRow: {
    flexDirection: "row",
    gap: scale(3),
  },
});

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
  showHorizontalPadding: boolean,
) =>
  StyleSheet.create({
    phoneCardsRow: {
      flexDirection: "row",
      paddingHorizontal: showHorizontalPadding ? spacing.screenPadding : 0,
      gap: spacing.itemGap,
    },
    phoneCardContainer: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: scale(16),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(8),
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    phoneCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    },
    radioOuter: {
      width: scale(18),
      height: scale(18),
      borderRadius: scale(9),
      borderWidth: 1.5,
      borderColor: colors.subtext,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(10),
    },
    radioInner: {
      width: scale(9),
      height: scale(9),
      borderRadius: scale(4.5),
      backgroundColor: colors.primary,
    },
    phoneFrame: {
      width: "100%",
      height: verticalScale(120),
      borderRadius: scale(14),
      padding: scale(6),
      marginBottom: verticalScale(10),
    },
    phoneCardLabel: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
      color: colors.subtext,
    },
    phoneCardLabelSelected: {
      color: colors.primary,
    },
  });

export default ThemePhonePicker;
