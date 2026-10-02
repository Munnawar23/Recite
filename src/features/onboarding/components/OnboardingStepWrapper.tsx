import { Background, Button } from "@/components";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

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
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { paddingTop, paddingBottom } = useAppSafeAreaInsets();

  const isLastStep = step === TOTAL_STEPS;
  const buttonLabel =
    primaryLabel ??
    (isLastStep
      ? t("onboarding.getStarted", "Get Started")
      : t("onboarding.next", "Next"));

  const S = createStyles(
    colors,
    fontFamily,
    fontSize,
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
        <Text style={S.stepCounter}>
          {t("onboarding.stepOf", "{{current}} of {{total}}", {
            current: step,
            total: TOTAL_STEPS,
          })}
        </Text>

        {/* ── Icon badge ── */}
        <View style={S.iconBadge}>
          <Ionicons name={icon} size={scale(28)} color={colors.primary} />
        </View>

        {/* ── Title & subtitle ── */}
        <Text style={S.title}>{title}</Text>
        <Text style={S.subtitle}>{subtitle}</Text>

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
  fontFamily: any,
  fontSize: any,
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
      paddingTop: paddingTop + verticalScale(4),
      paddingBottom: paddingBottom + verticalScale(10),
    },
    progressRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: scale(6),
      marginTop: verticalScale(10),
      marginBottom: verticalScale(2),
    },
    dot: {
      width: scale(28),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    dotDone: {
      backgroundColor: colors.primary + "55",
    },
    stepCounter: {
      textAlign: "center",
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
      color: colors.subtext,
      marginBottom: verticalScale(14),
    },
    iconBadge: {
      width: scale(62),
      height: scale(62),
      borderRadius: scale(18),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: verticalScale(12),
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    title: {
      fontFamily: fontFamily.heading,
      fontSize: fontSize.cardTitle,
      color: colors.text,
      textAlign: "center",
      marginBottom: verticalScale(4),
    },
    subtitle: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.bodyLg,
      color: colors.subtext,
      textAlign: "center",
      lineHeight: verticalScale(20),
      marginBottom: verticalScale(16),
    },
    content: {
      flex: 1,
    },
    actions: {
      gap: verticalScale(8),
      marginTop: verticalScale(12),
    },
    buttonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    backBtn: {
      flex: 1,
    },
    flexBtn: {
      flex: 1,
    },
  });

export default OnboardingStepWrapper;
