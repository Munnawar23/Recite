import { useAppTheme } from "@/hooks/useAppTheme";
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from "@/i18n";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";
import { OnboardingStepWrapper } from "./OnboardingStepWrapper";

interface AppLanguageStepProps {
  onNext: () => void;
}

export function AppLanguageStep({ onNext }: AppLanguageStepProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();

  const S = createStyles(colors, fontFamily, fontSize, spacing);

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
                Haptics.medium();
                setLanguage(lang.code as SupportedLanguageCode);
              }}
              activeOpacity={0.7}
            >
              <Text style={[S.languageLabel, isSelected && S.selectedLabel]}>
                {t(`languages.${lang.code}`, lang.label)}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={scale(20)}
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
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    listContainer: {
      gap: spacing.vSm,
      paddingBottom: verticalScale(12),
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: scale(12),
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(14),
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedItem: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "12",
    },
    languageLabel: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      color: colors.text,
    },
    selectedLabel: {
      color: colors.primary,
    },
  });

export default AppLanguageStep;
