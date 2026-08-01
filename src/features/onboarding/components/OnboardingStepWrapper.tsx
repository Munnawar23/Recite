import { useAppTheme } from "@/hooks/useAppTheme";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { Button } from "@/components/ui/Button";
import Background from "@/components/layout/Background";

const TOTAL_STEPS = 5;

interface OnboardingStepWrapperProps {
  step: number; // 1-based
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  /** Label for the primary action button */
  primaryLabel?: string;
  onPrimary: () => void;
  /** Optional handler to navigate to previous step */
  onBack?: () => void;
  /** If true, primary button shows a loading indicator */
  primaryLoading?: boolean;
  /** If false, hides the skip link */
  showSkip?: boolean;
  onSkip?: () => void;
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
  showSkip = true,
  onSkip,
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

  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <View style={{ flex: 1 }}>
      <Background />
      <View style={[S.container, { paddingTop: paddingTop + verticalScale(8), paddingBottom: paddingBottom + verticalScale(16) }]}>
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
                style={[S.backBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
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
          {showSkip && onSkip && (
            <TouchableOpacity style={S.skipBtn} onPress={onSkip} activeOpacity={0.7}>
              <Text style={S.skipText}>{t("onboarding.skip", "Skip")}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, spacing: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.screenPadding,
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
    skipBtn: {
      alignItems: "center",
      paddingVertical: verticalScale(10),
    },
    skipText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      color: colors.subtext,
    },
  });

export default OnboardingStepWrapper;
