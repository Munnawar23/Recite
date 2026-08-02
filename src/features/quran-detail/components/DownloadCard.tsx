import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";
import { scale, verticalScale } from "react-native-size-matters";
import * as FileSystem from "expo-file-system/legacy";
import {
  createAudioDownload,
  prepareAudioDir,
  downloadChapterText,
  deleteChapterDownload,
  getLocalAudioPath,
} from "@/services/downloadService";
import { useDownloadsStore } from "@/store/downloadsStore";
import MessageModal from "@/components/ui/MessageModal";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";

interface DownloadCardProps {
  chapterId?: number;
  reciterName?: string;
  selectedTransId?: string;
  audioUrl?: string | null;
  audioTotalBytes?: number | null; // from API audio_file.file_size
  isPlayingLocally?: boolean;
}

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];
type ThemeFontFamily = ReturnType<typeof useAppTheme>["fontFamily"];
type ThemeFontSize = ReturnType<typeof useAppTheme>["fontSize"];

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
  const size = scale(34);
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
      <Ionicons name="close" size={scale(14)} color={primaryColor} />
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
}: DownloadCardProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";

  const isDownloaded = useDownloadsStore(
    (s) => chapterId != null && s.isDownloaded(chapterId),
  );
  const getDownload = useDownloadsStore((s) => s.getDownload);
  const addDownload = useDownloadsStore((s) => s.addDownload);
  const removeDownload = useDownloadsStore((s) => s.removeDownload);

  const [isDownloading, setIsDownloading] = useState(false);
  const [bytesWritten, setBytesWritten] = useState(0);
  const [totalBytes, setTotalBytes] = useState<number>(audioTotalBytes ?? 0);

  // Modal states
  const [messageModalState, setMessageModalState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
  }>({ visible: false, title: "", message: "" });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const downloadRef = useRef<FileSystem.DownloadResumable | null>(null);
  const cancelledRef = useRef(false);

  // Sync totalBytes when prop arrives (from API)
  useEffect(() => {
    if (audioTotalBytes && audioTotalBytes > 0) {
      setTotalBytes(audioTotalBytes);
    }
  }, [audioTotalBytes]);

  const downloadInfo = chapterId != null ? getDownload(chapterId) : undefined;
  const storedTotalMB = downloadInfo
    ? formatMB(downloadInfo.totalBytes)
    : null;

  // Progress 0→1
  const progress = totalBytes > 0 ? Math.min(bytesWritten / totalBytes, 1) : 0;
  const writtenMB = formatMB(bytesWritten);
  const totalMB = totalBytes > 0 ? formatMB(totalBytes) : "?";

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

    Haptics.medium();
    setIsDownloading(true);
    setBytesWritten(0);
    cancelledRef.current = false;

    try {
      await prepareAudioDir();

      // ── Audio download ──────────────────────────────────────────
      const resumable = createAudioDownload(
        chapterId,
        audioUrl,
        (written, total) => {
          if (cancelledRef.current) return;
          setBytesWritten(written);
          if (total > 0) setTotalBytes(total);
        },
      );
      downloadRef.current = resumable;

      const result = await resumable.downloadAsync();
      if (cancelledRef.current || !result?.uri) return;

      const audioLocalPath = getLocalAudioPath(chapterId);

      // ── Text download (all 6 translations) ─────────────────────
      const textBytes = await downloadChapterText(chapterId);
      if (cancelledRef.current) return;

      const audioInfo = await FileSystem.getInfoAsync(audioLocalPath);
      const audioBytes = audioInfo.exists && "size" in audioInfo ? audioInfo.size : totalBytes;

      // ── Persist to store ────────────────────────────────────────
      addDownload({
        chapterId,
        downloadedAt: Date.now(),
        audioLocalFile: `chapter_${chapterId}.mp3`,
        textLocalFile: `chapter_${chapterId}_text.json`,
        totalBytes: audioBytes + textBytes,
      });

      Haptics.success();
    } catch (err: any) {
      if (cancelledRef.current) return; // user cancelled — silent
      console.error("[DownloadCard] Download failed:", err);
      setMessageModalState({
        visible: true,
        title: t("quran.downloadCard.errorTitle", "Download Failed"),
        message: t(
          "quran.downloadCard.errorBody",
          "Could not complete download. Please check your connection and try again.",
        ),
        icon: "alert-circle-outline",
        iconColor: "#EF4444",
      });
    } finally {
      if (!cancelledRef.current) {
        setIsDownloading(false);
      }
    }
  }, [chapterId, audioUrl, totalBytes, addDownload, t]);

  const handleCancelDownload = useCallback(async () => {
    Haptics.medium();
    cancelledRef.current = true;
    try {
      await downloadRef.current?.cancelAsync();
    } catch {
      // ignore
    }
    downloadRef.current = null;
    setIsDownloading(false);
    setBytesWritten(0);
  }, []);

  const handleDeletePress = useCallback(() => {
    if (!chapterId) return;
    Haptics.medium();
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
    () => createStyles(colors, fontFamily, fontSize, isDark),
    [colors, fontFamily, fontSize, isDark],
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
            size={scale(20)}
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
                  paddingHorizontal: scale(8),
                  paddingVertical: verticalScale(3),
                  marginBottom: verticalScale(2),
                },
              ]}
            >
              <Text numberOfLines={1} style={[S.title, { color: colors.primary }]}>
                {titleText}
              </Text>
            </View>
          ) : (
            <Text numberOfLines={1} style={S.title}>
              {titleText}
            </Text>
          )}
          <Text numberOfLines={1} style={S.subtitle}>
            {subtitleText}
          </Text>
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
                size={scale(20)}
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
                size={scale(14)}
                color={colors.card}
              />
              <Text style={S.downloadBtnText}>
                {t("quran.downloadCard.download", "Download")}
              </Text>
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
  fontFamily: ThemeFontFamily,
  fontSize: ThemeFontSize,
  _isDark: boolean,
) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      marginHorizontal: 0,
      marginTop: verticalScale(12),
      marginBottom: verticalScale(4),
      borderRadius: scale(16),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(16),
      paddingVertical: verticalScale(12),
    },
    squircle: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      flex: 1,
      marginLeft: scale(12),
      marginRight: scale(8),
    },
    title: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
    },
    subtitle: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      marginTop: verticalScale(2),
    },
    subtitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      marginTop: verticalScale(2),
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      paddingHorizontal: scale(7),
      paddingVertical: verticalScale(2),
      borderRadius: scale(10),
      borderWidth: 1,
    },
    badgeDot: {
      width: scale(5),
      height: scale(5),
      borderRadius: scale(3),
    },
    badgeText: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption,
    },
    rightAction: {
      justifyContent: "center",
      alignItems: "center",
    },
    downloadBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: colors.primary,
      paddingHorizontal: scale(12),
      paddingVertical: verticalScale(6),
      borderRadius: scale(20),
    },
    downloadBtnText: {
      color: colors.card,
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption,
    },
    deleteIconBtn: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      backgroundColor: "rgba(239, 68, 68, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(239, 68, 68, 0.25)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
