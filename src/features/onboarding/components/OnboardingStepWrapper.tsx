import { AppText, Background, Button } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const TOTAL_STEPS = 5;

interface OnboardingStepWrapperProps {
  step: number;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  primaryLabel?: string;
  onPrimary: () => void;
  onBack?: () => void;
  primaryLoading?: boolean;
}

export function OnboardingStepWrapper({
  step,
  title,
  subtitle,
  icon,
  children,
  primaryLabel,
  onPrimary,
  onBack,
  primaryLoading = false,
}: OnboardingStepWrapperProps) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { paddingTop, paddingBottom } = useAppSafeAreaInsets();

  const isLastStep = step === TOTAL_STEPS;
  const buttonLabel =
    primaryLabel ??
    (isLastStep
      ? t("onboarding.getStarted", "Get Started")
      : t("onboarding.next", "Next"));

  const S = createStyles(
    colors,
    spacing,
    paddingTop,
    paddingBottom,
  );

  return (
    <View style={S.root}>
      <Background />
      <View style={S.container}>
        {/* ── Progress dots ── */}
        <View style={S.progressRow}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                S.dot,
                i + 1 === step && S.dotActive,
                i + 1 < step && S.dotDone,
              ]}
            />
          ))}
        </View>

        {/* ── Step counter ── */}
        <AppText
          variant="caption"
          color="subtext"
          align="center"
          style={S.stepCounter}
        >
          {t("onboarding.stepOf", "{{current}} of {{total}}", {
            current: step,
            total: TOTAL_STEPS,
          })}
        </AppText>

        {/* ── Icon badge ── */}
        <View style={S.iconBadge}>
          <Ionicons name={icon} size={rs.icon(28)} color={colors.primary} />
        </View>

        {/* ── Title & subtitle ── */}
        <AppText
          variant="cardTitle"
          family="heading"
          color="text"
          align="center"
          style={S.title}
        >
          {title}
        </AppText>
        <AppText
          variant="bodyLg"
          color="subtext"
          align="center"
          lineHeight={rs.space(20)}
          style={S.subtitle}
        >
          {subtitle}
        </AppText>

        {/* ── Step-specific content ── */}
        <View style={S.content}>{children}</View>

        {/* ── Actions ── */}
        <View style={S.actions}>
          <View style={S.buttonsRow}>
            {onBack && (
              <Button
                tx="common.back"
                title="Back"
                onPress={onBack}
                style={[
                  S.backBtn,
                  {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                textStyle={{ color: colors.text }}
              />
            )}
            <Button
              title={buttonLabel}
              onPress={onPrimary}
              loading={primaryLoading}
              style={onBack ? S.flexBtn : undefined}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
  paddingTop: number,
  paddingBottom: number,
) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.screenPadding,
      paddingTop: paddingTop + rs.space(4),
      paddingBottom: paddingBottom + rs.space(10),
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: rs.space(6),
      marginTop: rs.space(10),
      marginBottom: rs.space(2),
    },
    dot: {
      width: rs.space(28),
      height: rs.space(4),
      borderRadius: rs.space(2),
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    dotDone: {
      backgroundColor: colors.primary + "55",
    },
    stepCounter: {
      marginBottom: rs.space(14),
    },
    iconBadge: {
      width: rs.space(62),
      height: rs.space(62),
      borderRadius: rs.space(18),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: rs.space(12),
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    title: {
      marginBottom: rs.space(4),
    },
    subtitle: {
      marginBottom: rs.space(16),
    },
    content: {
      flex: 1,
    },
    actions: {
      gap: rs.space(8),
      marginTop: rs.space(12),
    },
    buttonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(10),
    },
    backBtn: {
      flex: 1,
    },
    flexBtn: {
      flex: 1,
    },
  });

export default OnboardingStepWrapper;
