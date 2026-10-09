import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { ThemeMode, useThemeStore } from "@/store/themeStore";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AppText } from "./AppText";

interface ThemePhonePickerProps {
  showHorizontalPadding?: boolean;
}

export function ThemePhonePicker({ showHorizontalPadding = true }: ThemePhonePickerProps) {
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors, spacing } = useAppTheme();

  const S = createStyles(colors, spacing, showHorizontalPadding);

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
              Haptics.light();
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
            <AppText
              variant="body"
              family="title"
              color={isSelected ? "primary" : "subtext"}
            >
              {opt.label}
            </AppText>
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
    borderRadius: rs.space(10),
    padding: rs.space(6),
    gap: rs.space(4),
  },
  lightHeader: {
    height: rs.space(6),
    width: "40%",
    backgroundColor: "#3F7A5C",
    borderRadius: rs.space(3),
  },
  lightBanner: {
    height: rs.space(20),
    backgroundColor: "#3F7A5C",
    borderRadius: rs.space(6),
    opacity: 0.85,
  },
  lightCard: {
    height: rs.space(12),
    backgroundColor: "#FAF4EC",
    borderRadius: rs.space(4),
    borderWidth: 0.5,
    borderColor: "#E3D5C1",
  },
  lightBox: {
    flex: 1,
    height: rs.space(18),
    backgroundColor: "#FAF4EC",
    borderRadius: rs.space(4),
    borderWidth: 0.5,
    borderColor: "#E3D5C1",
  },
  lightNav: {
    height: rs.space(10),
    backgroundColor: "#E3D5C1",
    borderRadius: rs.space(3),
    marginTop: "auto",
  },
  darkBody: {
    flex: 1,
    backgroundColor: "#121415",
    borderRadius: rs.space(10),
    padding: rs.space(6),
    gap: rs.space(4),
  },
  darkHeader: {
    height: rs.space(6),
    width: "40%",
    backgroundColor: "#D4A86A",
    borderRadius: rs.space(3),
  },
  darkBanner: {
    height: rs.space(20),
    backgroundColor: "#192223",
    borderRadius: rs.space(6),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkCard: {
    height: rs.space(12),
    backgroundColor: "#192223",
    borderRadius: rs.space(4),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkBox: {
    flex: 1,
    height: rs.space(18),
    backgroundColor: "#192223",
    borderRadius: rs.space(4),
    borderWidth: 0.5,
    borderColor: "#1E2B2C",
  },
  darkNav: {
    height: rs.space(10),
    backgroundColor: "#1E2B2C",
    borderRadius: rs.space(3),
    marginTop: "auto",
  },
  systemContainer: {
    flex: 1,
    flexDirection: "row",
    borderRadius: rs.space(10),
    overflow: "hidden",
  },
  splitLeft: {
    flex: 1,
    backgroundColor: "#F2E9DD",
    padding: rs.space(6),
    gap: rs.space(4),
  },
  splitRight: {
    flex: 1,
    backgroundColor: "#121415",
    padding: rs.space(6),
    gap: rs.space(4),
  },
  gridRow: {
    flexDirection: "row",
    gap: rs.space(3),
  },
});

const createStyles = (
  colors: any,
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
      borderRadius: rs.space(16),
      paddingVertical: rs.space(14),
      paddingHorizontal: rs.space(8),
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    phoneCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    },
    radioOuter: {
      width: rs.space(18),
      height: rs.space(18),
      borderRadius: rs.space(9),
      borderWidth: 1.5,
      borderColor: colors.subtext,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: rs.space(10),
    },
    radioInner: {
      width: rs.space(9),
      height: rs.space(9),
      borderRadius: rs.space(4.5),
      backgroundColor: colors.primary,
    },
    phoneFrame: {
      width: "100%",
      height: rs.space(140),
      borderRadius: rs.space(14),
      padding: rs.space(6),
      marginBottom: rs.space(10),
    },
  });

export default ThemePhonePicker;
