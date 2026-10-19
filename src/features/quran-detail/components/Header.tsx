import { AppText, CommonModal } from "@/components";
import { DEFAULT_RECITER_ID, RECITER_OPTIONS, getSurahName } from "@/constants";
import { rs } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useLanguageStore } from "@/store/languageStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface DetailHeaderProps {
  chapterId: number;
  arabicName?: string;
  localizedName?: string;
  versesCount?: string;
  type?: string;
}

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];

function DetailHeader({
  chapterId,
  arabicName,
  localizedName,
  versesCount,
  type,
}: DetailHeaderProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, activeScheme } = useAppTheme();
  const { paddingTop } = useAppSafeAreaInsets();
  const language = useLanguageStore((state) => state.language);
  const [isReciterModalVisible, setIsReciterModalVisible] = useState(false);

  // Reciter settings
  const reciterId = useQuranSettingsStore((state) => state.reciterId);
  const setReciterId = useQuranSettingsStore((state) => state.setReciterId);
  const activeReciterId = reciterId || DEFAULT_RECITER_ID;

  const currentReciter = useMemo(
    () =>
      RECITER_OPTIONS.find((r) => r.id === activeReciterId) ||
      RECITER_OPTIONS[0],
    [activeReciterId],
  );

  const reciterDropdownItems = useMemo(
    () =>
      RECITER_OPTIONS.map((r) => ({
        label: r.label,
        value: String(r.id),
        avatar: r.avatar,
      })),
    [],
  );

  const localizedSurahName = useMemo(
    () => localizedName || getSurahName(chapterId, language),
    [chapterId, language, localizedName],
  );
  const isDark = activeScheme === "dark";

  const S = useMemo(
    () => createStyles(colors, isDark, paddingTop),
    [colors, isDark, paddingTop],
  );

  const handleBack = useCallback(() => {
    Haptics.light();
    router.back();
  }, [router]);

  const androidBgStyle = useMemo(
    () => [
      StyleSheet.absoluteFill,
      { backgroundColor: colors.background + "EE" },
    ],
    [colors.background],
  );

  return (
    <View style={S.headerContainer}>
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={60}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={androidBgStyle} />
      )}

      {/* Top Title Bar */}
      <View style={S.topBar}>
        <View style={S.leftActions}>
          <TouchableOpacity
            onPress={handleBack}
            style={S.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={rs.icon(22)}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        <View style={S.headerCenter}>
          <AppText
            variant="cardTitle"
            family="quran"
            color="primary"
            align="center"
            numberOfLines={1}
            style={S.arabicTitle}
          >
            {arabicName || "—"}
          </AppText>
          <AppText
            variant="bodyLg"
            family="title"
            color="text"
            align="center"
            numberOfLines={1}
            style={S.surahName}
          >
            {localizedSurahName || "—"}
          </AppText>
          <AppText
            variant="caption"
            family="text"
            color="subtext"
            align="center"
            numberOfLines={1}
            style={S.surahMeta}
          >
            {type || "—"} • {versesCount || "—"} Verses
          </AppText>
        </View>

        <View style={S.rightActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.light();
              setIsReciterModalVisible(true);
            }}
            style={S.reciterButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.preferences.title", "Choose Quran Reciter")}
          >
            {currentReciter?.avatar ? (
              <Image
                source={currentReciter.avatar}
                style={S.reciterAvatar}
                contentFit="cover"
              />
            ) : (
              <Ionicons
                name="mic-outline"
                size={rs.icon(18)}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <CommonModal
        visible={isReciterModalVisible}
        onClose={() => setIsReciterModalVisible(false)}
        title={t("onboarding.preferences.title", "Choose Quran Reciter")}
        icon="mic-outline"
        data={reciterDropdownItems}
        value={String(activeReciterId)}
        onChange={(item) => {
          Haptics.light();
          setReciterId(Number(item.value));
        }}
      />
    </View>
  );
}

export default React.memo(DetailHeader);

const createStyles = (
  colors: ThemeColors,
  isDark: boolean,
  paddingTop: number,
) =>
  StyleSheet.create({
    headerContainer: {
      paddingTop: paddingTop,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      overflow: "hidden",
      zIndex: 10,
      paddingBottom: rs.space(2),
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: rs.space(12),
      paddingTop: rs.space(4),
      paddingBottom: rs.space(4),
    },
    leftActions: {
      width: rs.space(60),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    rightActions: {
      width: rs.space(60),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: rs.space(6),
    },
    actionButton: {
      width: rs.space(32),
      height: rs.space(32),
      borderRadius: rs.space(16),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    reciterButton: {
      width: rs.space(34),
      height: rs.space(34),
      borderRadius: rs.space(17),
      borderWidth: 1.5,
      borderColor: colors.primary,
      overflow: "hidden",
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginRight: rs.space(6),
    },
    reciterAvatar: {
      width: "100%",
      height: "100%",
      borderRadius: rs.space(17),
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: rs.space(5),
    },
    arabicTitle: {
      lineHeight: rs.space(25),
    },
    surahName: {
      lineHeight: rs.space(20),
    },
    surahMeta: {
      lineHeight: rs.space(16),
    },
  });
