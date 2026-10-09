import { AppText } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/i18n";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface AppLanguageStepProps {
  onNext: () => void;
}

export function AppLanguageStep({ onNext }: AppLanguageStepProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { colors, spacing } = useAppTheme();

  const S = createStyles(colors, spacing);

  return (
    <OnboardingStepWrapper
      step={1}
      title={t("onboarding.language.title", "Choose Your Language")}
      subtitle={t(
        "onboarding.language.subtitle",
        "Select your preferred language for menus and the app interface.",
      )}
      icon="globe-outline"
      onPrimary={onNext}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={S.listContainer}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[S.languageItem, isSelected && S.selectedItem]}
              onPress={() => {
                Haptics.light();
                setLanguage(lang.code as SupportedLanguageCode);
              }}
              activeOpacity={0.7}
            >
              <AppText
                variant="bodyLg"
                family="title"
                color={isSelected ? "primary" : "text"}
              >
                {t(`languages.${lang.code}`, lang.label)}
              </AppText>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={rs.icon(20)}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </OnboardingStepWrapper>
  );
}

const createStyles = (
  colors: any,
  spacing: any,
) =>
  StyleSheet.create({
    listContainer: {
      gap: spacing.vSm,
      paddingBottom: rs.space(12),
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: rs.space(12),
      paddingHorizontal: rs.space(16),
      paddingVertical: rs.space(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedItem: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "12",
    },
  });

export default AppLanguageStep;
