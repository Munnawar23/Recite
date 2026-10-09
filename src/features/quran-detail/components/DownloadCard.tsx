import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { rs } from "@/helpers/responsiveHelper";
import {
  startChapterDownload,
  cancelChapterDownload,
  deleteChapterDownload,
} from "@/services/downloadService";
import { useDownloadsStore } from "@/store/downloadsStore";
import { MessageModal, DeleteConfirmationModal, AppText } from "@/components";

interface DownloadCardProps {
  chapterId?: number;
  reciterName?: string;
  selectedTransId?: string;
  audioUrl?: string | null;
  audioTotalBytes?: number | null; // from API audio_file.file_size
  isPlayingLocally?: boolean;
  // Chapter display info for offline library
  arabicName?: string;
  englishName?: string;
  englishTranslation?: string;
  versesCount?: string;
  chapterType?: string;
}

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];

// ─── Circular Progress ────────────────────────────────────────────────────────

function CircularProgressControl({
  progress,
  onCancel,
  primaryColor,
  trackColor,
}: {
  progress: number;
  onCancel: () => void;
  primaryColor: string;
  trackColor: string;
}) {
  const size = rs.space(34);
  const strokeWidth = 3;
  const radius = (size - strokeWidth - 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress || 0) * circumference;

  return (
    <Pressable
      onPress={onCancel}
      accessibilityRole="button"
      accessibilityLabel="Cancel Download"
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <Ionicons name="close" size={rs.icon(14)} color={primaryColor} />
    </Pressable>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

// ─── Main Component ───────────────────────────────────────────────────────────

function DownloadCard({
  chapterId,
  reciterName = "Mishary Rashid Alafasy",
  audioUrl,
  audioTotalBytes,
  isPlayingLocally = false,
  arabicName,
  englishName,
  englishTranslation,
  versesCount,
  chapterType,
}: DownloadCardProps) {
  const { t } = useTranslation();
  const { colors, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const isDownloaded = useDownloadsStore(
    (s) => chapterId != null && s.isDownloaded(chapterId),
  );
  const getDownload = useDownloadsStore((s) => s.getDownload);
  const removeDownload = useDownloadsStore((s) => s.removeDownload);

  const activeDownload = useDownloadsStore((s) =>
    chapterId != null ? s.activeDownloads[chapterId] : undefined,
  );
  const isDownloading = activeDownload?.status === "downloading";
  const bytesWritten = activeDownload?.bytesWritten ?? 0;
  const totalBytes =
    activeDownload && activeDownload.totalBytes > 0
      ? activeDownload.totalBytes
      : (audioTotalBytes ?? 0);

  // Progress 0→1
  const progress =
    activeDownload?.progress ??
    (totalBytes > 0 ? Math.min(bytesWritten / totalBytes, 1) : 0);
  const writtenMB = formatMB(bytesWritten);
  const totalMB = totalBytes > 0 ? formatMB(totalBytes) : "?";

  // Modal states
  const [messageModalState, setMessageModalState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
  }>({ visible: false, title: "", message: "" });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Handle errors from background download
  useEffect(() => {
    if (activeDownload?.status === "error") {
      setMessageModalState({
        visible: true,
        title: t("quran.downloadCard.errorTitle", "Download Failed"),
        message:
          activeDownload.errorMessage ||
          t(
            "quran.downloadCard.errorBody",
            "Could not complete download. Please check your connection and try again.",
          ),
        icon: "alert-circle-outline",
        iconColor: "#EF4444",
      });
      if (chapterId != null) {
        useDownloadsStore.getState().removeActiveDownload(chapterId);
      }
    }
  }, [activeDownload?.status, activeDownload?.errorMessage, chapterId, t]);

  const downloadInfo = chapterId != null ? getDownload(chapterId) : undefined;
  const storedTotalMB = downloadInfo
    ? formatMB(downloadInfo.totalBytes)
    : null;

  const handleStartDownload = useCallback(async () => {
    if (!chapterId || !audioUrl) {
      setMessageModalState({
        visible: true,
        title: t("quran.downloadCard.notReadyTitle", "Audio Not Ready"),
        message: t(
          "quran.downloadCard.notReadyBody",
          "Audio information is loading. Please try again in a moment.",
        ),
        icon: "information-circle-outline",
        iconColor: colors.primary,
      });
      return;
    }

    Haptics.light();

    try {
      await startChapterDownload({
        chapterId,
        audioUrl,
        initialTotalBytes: audioTotalBytes ?? 0,
        chapterInfo:
          arabicName || englishName
            ? {
                name: arabicName ?? "",
                englishName: englishName ?? "",
                englishTranslation: englishTranslation ?? "",
                versesCount: versesCount ? parseInt(versesCount, 10) : 0,
                chapterType: chapterType ?? "",
              }
            : undefined,
      });
    } catch {
      // Error is caught in startChapterDownload and updated in activeDownloads store
    }
  }, [
    chapterId,
    audioUrl,
    audioTotalBytes,
    arabicName,
    englishName,
    englishTranslation,
    versesCount,
    chapterType,
    colors.primary,
    t,
  ]);

  const handleCancelDownload = useCallback(async () => {
    if (!chapterId) return;
    Haptics.light();
    await cancelChapterDownload(chapterId);
  }, [chapterId]);

  const handleDeletePress = useCallback(() => {
    if (!chapterId) return;
    Haptics.light();
    setDeleteModalVisible(true);
  }, [chapterId]);

  const handleConfirmDelete = useCallback(async () => {
    setDeleteModalVisible(false);
    if (!chapterId) return;
    await deleteChapterDownload(chapterId);
    removeDownload(chapterId);
    Haptics.success();
  }, [chapterId, removeDownload]);

  const S = useMemo(
    () => createStyles(colors),
    [colors],
  );

  // ─── Title text ─────────────────────────────────────────────────────────────
  const titleText = useMemo(() => {
    if (isDownloading) {
      return `${Math.round(progress * 100)}%`;
    }
    if (isDownloaded) {
      return t("quran.downloadCard.playingOfflineTitle", "Playing Offline");
    }
    return t("quran.downloadCard.playingOnlineTitle", "Playing Online");
  }, [isDownloading, isDownloaded, progress, t]);

  // ─── Subtitle text ──────────────────────────────────────────────────────────
  const subtitleText = useMemo(() => {
    if (isDownloaded && storedTotalMB) {
      return `${storedTotalMB} MB`;
    }
    if (isDownloading) {
      if (totalBytes > 0) {
        return `${writtenMB} MB / ${totalMB} MB`;
      }
      return t("quran.downloadCard.downloading", "Downloading...");
    }
    if (totalBytes > 0) {
      return `${totalMB} MB`;
    }
    return t("quran.downloadCard.ready", "Audio & Text");
  }, [
    isDownloaded,
    storedTotalMB,
    isDownloading,
    writtenMB,
    totalMB,
    totalBytes,
    t,
  ]);

  return (
    <View style={S.container}>
      <View style={S.cardContent}>
        {/* Left Icon */}
        <View style={[S.squircle, { backgroundColor: colors.primary + "20" }]}>
          <Ionicons
            name={isDownloaded ? "checkmark-circle-outline" : "download-outline"}
            size={rs.icon(20)}
            color={colors.primary}
          />
        </View>

        {/* Text Area */}
        <View style={S.textContainer}>
          {isDownloaded ? (
            <View
              style={[
                S.badge,
                {
                  backgroundColor: colors.primary + "18",
                  borderColor: colors.primary + "35",
                  alignSelf: "flex-start",
                  paddingHorizontal: rs.space(8),
                  paddingVertical: rs.space(3),
                  marginBottom: rs.space(2),
                },
              ]}
            >
              <AppText variant="body" family="title" color="primary" numberOfLines={1}>
                {titleText}
              </AppText>
            </View>
          ) : (
            <AppText variant="body" family="title" color="text" numberOfLines={1}>
              {titleText}
            </AppText>
          )}
          <AppText variant="body" color="subtext" numberOfLines={1} style={S.subtitle}>
            {subtitleText}
          </AppText>
        </View>

        {/* Right Action */}
        <View style={S.rightAction}>
          {isDownloading ? (
            <CircularProgressControl
              progress={progress}
              onCancel={handleCancelDownload}
              primaryColor={colors.primary}
              trackColor={colors.border}
            />
          ) : isDownloaded ? (
            <TouchableOpacity
              style={S.deleteIconBtn}
              activeOpacity={0.7}
              onPress={handleDeletePress}
              accessibilityRole="button"
              accessibilityLabel="Remove download"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="trash-outline"
                size={rs.icon(20)}
                color="#EF4444"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={S.downloadBtn}
              activeOpacity={0.8}
              onPress={handleStartDownload}
              accessibilityRole="button"
              accessibilityLabel={t(
                "quran.downloadCard.download",
                "Download Surah",
              )}
            >
              <Ionicons
                name="download-outline"
                size={rs.icon(14)}
                color={colors.card}
              />
              <AppText variant="caption" family="title" color={colors.card}>
                {t("quran.downloadCard.download", "Download")}
              </AppText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Custom Modals */}
      <MessageModal
        visible={messageModalState.visible}
        onClose={() => setMessageModalState((prev) => ({ ...prev, visible: false }))}
        title={messageModalState.title}
        message={messageModalState.message}
        icon={messageModalState.icon}
        iconColor={messageModalState.iconColor}
      />

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        title={t("quran.downloadCard.deleteTitle", "Delete Download?")}
        description={t(
          "quran.downloadCard.deleteDesc",
          "Are you sure you want to remove this Surah recitation from your offline downloads?",
        )}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmText={t("common.remove", "Remove")}
        cancelText={t("common.cancel", "Cancel")}
      />
    </View>
  );
}

export default React.memo(DownloadCard);

const createStyles = (
  colors: ThemeColors,
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      marginHorizontal: 0,
      marginTop: rs.space(12),
      marginBottom: rs.space(4),
      borderRadius: rs.space(16),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: rs.space(16),
      paddingVertical: rs.space(12),
    },
    squircle: {
      width: rs.space(40),
      height: rs.space(40),
      borderRadius: rs.space(12),
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      flex: 1,
      marginLeft: rs.space(12),
      marginRight: rs.space(8),
    },
    subtitle: {
      marginTop: rs.space(2),
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(4),
      borderRadius: rs.space(10),
      borderWidth: 1,
    },
    rightAction: {
      justifyContent: "center",
      alignItems: "center",
    },
    downloadBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(4),
      backgroundColor: colors.primary,
      paddingHorizontal: rs.space(12),
      paddingVertical: rs.space(6),
      borderRadius: rs.space(20),
    },
    deleteIconBtn: {
      width: rs.space(34),
      height: rs.space(34),
      borderRadius: rs.space(17),
      backgroundColor: "rgba(239, 68, 68, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(239, 68, 68, 0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
