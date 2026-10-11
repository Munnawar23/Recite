import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AppText } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppSafeAreaInsets } from "@/hooks/useAppSafeAreaInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { useFavoritesStore } from "@/store/favoritesStore";
import type { SurahVerse } from "@/types";

interface VerseActionModalProps {
  visible: boolean;
  verse: SurahVerse | null;
  chapterId?: number;
  englishName?: string;
  isSharing?: boolean;
  onClose: () => void;
  onShare: (verse: SurahVerse) => void;
  onCopy: (verse: SurahVerse) => void;
  onFavorite: (verse: SurahVerse) => void;
}

export default function VerseActionModal({
  visible,
  verse,
  chapterId: _chapterId,
  englishName: _englishName,
  isSharing = false,
  onClose,
  onShare,
  onCopy,
  onFavorite,
}: VerseActionModalProps) {
  const { t } = useTranslation();
  const { colors, fontSize } = useAppTheme();
  const { paddingBottom } = useAppSafeAreaInsets();

  const isFavorited = useFavoritesStore((state) =>
    verse
      ? state.favoriteVerses.some((v) => v.verseKey === verse.verseKey)
      : false,
  );

  if (!verse) return null;

  const handleAction = (callback: (verse: SurahVerse) => void) => {
    Haptics.light();
    callback(verse);
  };

  const handleClose = () => {
    Haptics.light();
    onClose();
  };

  const S = createStyles(colors, paddingBottom);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={S.overlay}>
          <TouchableWithoutFeedback>
            <View style={S.sheetContainer}>
              {/* Drag Handle Indicator */}
              <View style={S.handleIndicator} />

              {/* Header Row: Verse Badge (Center) & Cross Button (Right) */}
              <View style={S.headerRow}>
                <View style={S.headerSpacer} />

                <View style={S.verseBadge}>
                  <AppText
                    variant="bodySm"
                    family="title"
                    color="primary"
                  >
                    {`﴿ ${verse.verseKey} ﴾`}
                  </AppText>
                </View>

                {/* Cross Close Button */}
                <TouchableOpacity
                  style={S.closeButton}
                  onPress={handleClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Close"
                >
                  <Ionicons
                    name="close"
                    size={rs.icon(18)}
                    color={colors.subtext}
                  />
                </TouchableOpacity>
              </View>

              {/* Verse Context Preview Card */}
              <View style={S.previewCard}>
                <AppText
                  size={fontSize.arabic * 0.9}
                  lineHeight={Math.round(fontSize.arabic * 0.9 * 2.0)}
                  family="quran"
                  align="center"
                  color={colors.quranVerse}
                  numberOfLines={3}
                  style={S.arabicText}
                >
                  {verse.arabic}
                </AppText>
                {verse.translation ? (
                  <AppText
                    variant="caption"
                    family="text"
                    color="subtext"
                    align="center"
                    numberOfLines={2}
                    style={S.translationText}
                  >
                    {verse.translation}
                  </AppText>
                ) : null}
              </View>

              {/* Action Buttons: 3 Action Cards */}
              <View style={S.actionsRow}>
                {/* 1. Share */}
                <TouchableOpacity
                  style={S.actionBtn}
                  activeOpacity={0.7}
                  disabled={isSharing}
                  onPress={() => handleAction(onShare)}
                  accessibilityLabel="Share verse"
                >
                  <View
                    style={[
                      S.actionIconCircle,
                      { backgroundColor: colors.primary + "16" },
                    ]}
                  >
                    {isSharing ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary}
                      />
                    ) : (
                      <Ionicons
                        name="share-social-outline"
                        size={rs.icon(19)}
                        color={colors.primary}
                      />
                    )}
                  </View>
                  <AppText
                    variant="caption"
                    family="title"
                    color="text"
                    align="center"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    maxFontSizeMultiplier={1.15}
                    style={S.actionLabel}
                  >
                    {isSharing ? t("common.sharing", "Sharing...") : t("common.share", "Share")}
                  </AppText>
                </TouchableOpacity>

                {/* 2. Copy */}
                <TouchableOpacity
                  style={S.actionBtn}
                  activeOpacity={0.7}
                  onPress={() => handleAction(onCopy)}
                  accessibilityLabel="Copy verse"
                >
                  <View
                    style={[
                      S.actionIconCircle,
                      { backgroundColor: colors.primary + "16" },
                    ]}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={rs.icon(19)}
                      color={colors.primary}
                    />
                  </View>
                  <AppText
                    variant="caption"
                    family="title"
                    color="text"
                    align="center"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    maxFontSizeMultiplier={1.15}
                    style={S.actionLabel}
                  >
                    {t("common.copy", "Copy")}
                  </AppText>
                </TouchableOpacity>

                {/* 3. Favourite */}
                <TouchableOpacity
                  style={S.actionBtn}
                  activeOpacity={0.7}
                  onPress={() => handleAction(onFavorite)}
                  accessibilityLabel={
                    isFavorited ? "Remove from favourites" : "Favourite verse"
                  }
                >
                  <View
                    style={[
                      S.actionIconCircle,
                      {
                        backgroundColor: isFavorited
                          ? colors.primary
                          : colors.primary + "16",
                      },
                    ]}
                  >
                    <Ionicons
                      name={isFavorited ? "heart" : "heart-outline"}
                      size={rs.icon(19)}
                      color={isFavorited ? "#FFFFFF" : colors.primary}
                    />
                  </View>
                  <AppText
                    variant="caption"
                    family="title"
                    color={isFavorited ? "primary" : "text"}
                    align="center"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    maxFontSizeMultiplier={1.15}
                    style={S.actionLabel}
                  >
                    {isFavorited
                      ? t("common.favorited", "Favorited")
                      : t("common.favourite", "Favourite")}
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (colors: any, paddingBottom: number) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      justifyContent: "flex-end",
    },
    sheetContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: rs.space(24),
      borderTopRightRadius: rs.space(24),
      borderWidth: 1,
      borderColor: colors.border,
      paddingTop: rs.space(12),
      paddingHorizontal: rs.space(20),
      paddingBottom: Math.max(paddingBottom + rs.space(12), rs.space(24)),
      gap: rs.space(14),
    },
    handleIndicator: {
      width: rs.space(38),
      height: rs.space(4),
      borderRadius: rs.space(2),
      backgroundColor: colors.border,
      alignSelf: "center",
      marginBottom: rs.space(2),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerSpacer: {
      width: rs.space(32),
      height: rs.space(32),
    },
    verseBadge: {
      backgroundColor: colors.primary + "16",
      paddingHorizontal: rs.space(8),
      paddingVertical: rs.space(3),
      borderRadius: rs.space(8),
      borderWidth: 1,
      borderColor: colors.primary + "28",
    },
    closeButton: {
      width: rs.space(32),
      height: rs.space(32),
      borderRadius: rs.space(16),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewCard: {
      backgroundColor: colors.background,
      borderRadius: rs.space(16),
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: rs.space(12),
      paddingHorizontal: rs.space(16),
      alignItems: "center",
      justifyContent: "center",
      gap: rs.space(6),
    },
    arabicText: {
      fontWeight: "600",
      width: "100%",
    },
    translationText: {
      lineHeight: rs.font(14) * 1.35,
      paddingHorizontal: rs.space(4),
    },
    actionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: rs.space(10),
    },
    actionBtn: {
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      paddingVertical: rs.space(10),
      paddingHorizontal: rs.space(5),
      borderRadius: rs.space(14),
      borderWidth: 1,
      borderColor: colors.border,
      gap: rs.space(6),
    },
    actionIconCircle: {
      width: rs.space(38),
      height: rs.space(38),
      borderRadius: rs.space(19),
      alignItems: "center",
      justifyContent: "center",
    },
    actionLabel: {
      width: "100%",
    },
  });
