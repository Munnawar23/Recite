import { AppText } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface DetailHeaderProps {
  chapterId: number;
  arabicName?: string;
  englishName?: string;
  versesCount?: string;
  type?: string;
}

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];

function DetailHeader({
  chapterId,
  arabicName,
  englishName,
  versesCount,
  type,
}: DetailHeaderProps) {
  const router = useRouter();
  const { colors, activeScheme } = useAppTheme();
  const { paddingTop } = useAppSafeAreaInsets();
  const isDark = activeScheme === "dark";

  const isFavorite = useFavoritesStore(
    useCallback((state) => state.favoriteIds.includes(chapterId), [chapterId]),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const S = useMemo(
    () => createStyles(colors, isDark, paddingTop),
    [colors, isDark, paddingTop],
  );

  const handleBack = useCallback(() => {
    Haptics.medium();
    router.back();
  }, [router]);

  const handleToggleFavorite = useCallback(() => {
    Haptics.light();
    toggleFavorite(chapterId);
    Toast.show({
      type: "success",
      text1: !isFavorite
        ? "Added to Favorites"
        : "Removed from Favorites",
      text2: !isFavorite
        ? `${englishName || `Surah ${chapterId}`} has been saved to your favorites.`
        : `${englishName || `Surah ${chapterId}`} removed from your favorites.`,
    });
  }, [toggleFavorite, chapterId, isFavorite, englishName]);

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
          >
            {arabicName || "—"}
          </AppText>
          <AppText
            variant="bodyLg"
            family="title"
            color="text"
            align="center"
          >
            {`Surah ${chapterId}: ${englishName || "—"}`}
          </AppText>
          <AppText
            variant="caption"
            family="text"
            color="subtext"
            align="center"
          >
            {type || "—"} • {versesCount || "—"} Verses
          </AppText>
        </View>

        <View style={S.rightActions}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={S.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={rs.icon(20)}
              color={isFavorite ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
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
      paddingBottom: rs.space(2),
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
    headerCenter: {
      flex: 1,
      alignItems: "center",
      gap: 0,
    },
  });
