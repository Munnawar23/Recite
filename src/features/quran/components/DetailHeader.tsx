import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import { Haptics } from "@/lib/haptics";
import { useRouter } from "expo-router";
import CommonModal from "@/components/ui/CommonModal";
import Toast from "react-native-toast-message";
import { useFavoritesStore } from "@/store/favoritesStore";

interface DetailHeaderProps {
  chapterId: number;
  arabicName?: string;
  englishName?: string;
  versesCount?: string;
  type?: string;
  translationOptions: { label: string; value: string }[];
  selectedTransId: string;
  onTranslationChange: (id: string) => void;
}

export default function DetailHeader({
  chapterId,
  arabicName,
  englishName,
  versesCount,
  type,
  translationOptions,
  selectedTransId,
  onTranslationChange,
}: DetailHeaderProps) {
  const router = useRouter();
  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const isFavorite = favoriteIds.includes(chapterId);

  const S = createStyles(colors, fontFamily, fontSize, isDark);

  return (
    <View style={S.headerContainer}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={60} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background + "EE" }]} />
      )}

      {/* Top Title Bar */}
      <View style={S.topBar}>
        <View style={S.leftActions}>
          <TouchableOpacity
            onPress={() => { Haptics.medium(); router.back(); }}
            style={S.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={scale(22)} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={S.headerCenter}>
          <Text style={S.headerArabic}>{arabicName || "—"}</Text>
          <Text style={S.headerTitle}>{`Surah ${chapterId}: ${englishName || "—"}`}</Text>
          <Text style={S.headerSubtitle}>
            {type || "—"} • {versesCount || "—"} Verses
          </Text>
        </View>

        <View style={S.rightActions}>
          <TouchableOpacity
            onPress={() => {
              Haptics.light();
              toggleFavorite(chapterId);
              Toast.show({
                type: "success",
                text1: !isFavorite ? "Added to Favorites" : "Removed from Favorites",
                text2: !isFavorite
                  ? `${englishName || `Surah ${chapterId}`} has been saved to your favorites.`
                  : `${englishName || `Surah ${chapterId}`} removed from your favorites.`,
              });
            }}
            style={S.actionButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={scale(20)}
              color={isFavorite ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Dropdown Selector Bar (Full Width) */}
      <View style={S.dropdownRow}>
        <CommonModal
          data={translationOptions}
          value={selectedTransId}
          onChange={(item) => onTranslationChange(item.value)}
          placeholder="Select Translation"
        />
      </View>
    </View>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, isDark: boolean) =>
  StyleSheet.create({
    headerContainer: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      overflow: "hidden",
      zIndex: 10,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(12),
      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(6),
    },
    leftActions: {
      width: scale(80),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    rightActions: {
      width: scale(80),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: scale(6),
    },
    actionButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
      gap: verticalScale(1),
    },
    headerArabic: {
      color: colors.primary,
      fontFamily: fontFamily.quran,
      fontSize: fontSize.heading,
    },
    headerTitle: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
    },
    headerSubtitle: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
    },
    dropdownRow: {
      paddingHorizontal: scale(16),
      paddingBottom: verticalScale(10),
      paddingTop: verticalScale(4),
      width: "100%",
    },
  });
