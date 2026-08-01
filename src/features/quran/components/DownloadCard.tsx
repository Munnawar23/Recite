import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useDownloadsStore, getDownloadKey } from "@/store/downloadsStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import { Haptics } from "@/lib/haptics";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import AppStoreProgressControl from "./AppStoreProgressControl";

interface DownloadCardProps {
  chapterId: number;
  reciterName: string;
  selectedTransId: string;
}

type ThemeColors = ReturnType<typeof useAppTheme>["colors"];
type ThemeFontFamily = ReturnType<typeof useAppTheme>["fontFamily"];
type ThemeFontSize = ReturnType<typeof useAppTheme>["fontSize"];

function DownloadCard({ chapterId, reciterName, selectedTransId }: DownloadCardProps) {
  const { t } = useTranslation();
  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const reciterId = useQuranSettingsStore((state) => state.reciterId);
  const activeReciterId = reciterId || 7;

  const downloadKey = useMemo(
    () => getDownloadKey(chapterId, activeReciterId),
    [chapterId, activeReciterId],
  );

  // Single Zustand selector for downloads store
  const getDownloadedChapter = useDownloadsStore((state) => state.getDownloadedChapter);
  const downloadedRecord = useMemo(
    () => getDownloadedChapter(chapterId, activeReciterId),
    [getDownloadedChapter, chapterId, activeReciterId],
  );
  const isDownloading = useDownloadsStore((state) => state.downloadingIds.has(downloadKey));
  const progData = useDownloadsStore((state) => state.downloadProgress[downloadKey]);
  const downloadChapter = useDownloadsStore((state) => state.downloadChapter);
  const cancelDownload = useDownloadsStore((state) => state.cancelDownload);
  const deleteChapter = useDownloadsStore((state) => state.deleteChapter);

  const isDownloaded = !!downloadedRecord;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const S = useMemo(
    () => createStyles(colors, fontFamily, fontSize, isDark),
    [colors, fontFamily, fontSize, isDark],
  );

  const handleDownloadPress = useCallback(() => {
    Haptics.medium();
    const transId = selectedTransId === "0" ? 20 : parseInt(selectedTransId, 10);
    downloadChapter(chapterId, transId, activeReciterId, reciterName);
  }, [chapterId, selectedTransId, activeReciterId, reciterName, downloadChapter]);

  const handleDeletePress = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteChapter(chapterId, downloadedRecord?.reciterId || activeReciterId);
    setShowDeleteModal(false);
  }, [deleteChapter, chapterId, downloadedRecord?.reciterId, activeReciterId]);

  const handleCancelPress = useCallback(() => {
    Haptics.medium();
    cancelDownload(chapterId, activeReciterId);
  }, [chapterId, activeReciterId, cancelDownload]);

  // Memoized progress calculations & titles
  const { fraction, progressPercent, writtenMB, totalMB } = useMemo(() => {
    const f = progData?.fraction ?? 0;
    const pPercent = Math.round(f * 100);
    const wMB = progData?.writtenBytes
      ? (progData.writtenBytes / (1024 * 1024)).toFixed(1)
      : "0.0";
    const tMB = progData?.totalBytes
      ? (progData.totalBytes / (1024 * 1024)).toFixed(1)
      : "0.0";

    return {
      fraction: f,
      progressPercent: pPercent,
      writtenMB: wMB,
      totalMB: tMB,
    };
  }, [progData?.fraction, progData?.writtenBytes, progData?.totalBytes]);

  const { title, squircleBg, squircleIconColor } = useMemo(() => {
    let bg = colors.primary + "20";
    let iconColor = colors.primary;
    let titleText = t("quran.downloadCard.download", "Download");

    if (isDownloading) {
      if (progData && progData.totalBytes > 0) {
        titleText = `${writtenMB} / ${totalMB} MB (${progressPercent}%)`;
      } else {
        titleText = `${progressPercent}%`;
      }
    } else if (isDownloaded) {
      bg = colors.primary;
      iconColor = colors.card;
      titleText = t("quran.downloadCard.playingOffline", "Downloaded for offline");
    }

    return {
      title: titleText,
      squircleBg: bg,
      squircleIconColor: iconColor,
    };
  }, [
    isDownloading,
    isDownloaded,
    progData,
    writtenMB,
    totalMB,
    progressPercent,
    colors.primary,
    colors.card,
    t,
  ]);

  const displayReciterName = useMemo(
    () => downloadedRecord?.reciterName || reciterName,
    [downloadedRecord?.reciterName, reciterName],
  );

  const squircleStyle = useMemo(
    () => [S.squircle, { backgroundColor: squircleBg }],
    [S.squircle, squircleBg],
  );

  return (
    <View style={S.container}>
      <View style={S.cardContent}>
        {/* Left Squircle Icon */}
        <View style={squircleStyle}>
          <Ionicons
            name={isDownloaded ? "checkmark" : "download-outline"}
            size={scale(20)}
            color={squircleIconColor}
          />
        </View>

        {/* Text Area */}
        <View style={S.textContainer}>
          <Text numberOfLines={1} style={S.title}>
            {title}
          </Text>
          <Text numberOfLines={1} style={S.subtitle}>
            {displayReciterName}
          </Text>
        </View>

        {/* Right Actions */}
        <View style={S.rightAction}>
          {isDownloaded ? (
            <TouchableOpacity
              onPress={handleDeletePress}
              style={S.deleteBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t("quran.downloadCard.deleteTitle", "Delete Download")}
            >
              <Ionicons name="trash-outline" size={scale(18)} color={colors.subtext} />
            </TouchableOpacity>
          ) : isDownloading ? (
            <AppStoreProgressControl
              progress={fraction}
              onCancel={handleCancelPress}
              primaryColor={colors.primary}
              trackColor={colors.border}
            />
          ) : (
            <TouchableOpacity
              onPress={handleDownloadPress}
              style={S.downloadBtn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t("quran.downloadCard.download", "Download Surah")}
            >
              <Ionicons name="download-outline" size={scale(14)} color={colors.card} />
              <Text style={S.downloadBtnText}>
                {t("quran.downloadCard.download", "Download")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Deletion Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        title={t("quran.downloadCard.deleteTitle", "Delete Download?")}
        description={t(
          "quran.downloadCard.deleteDesc",
          "Are you sure you want to remove this Surah recitation from your offline downloads?",
        )}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

export default React.memo(DownloadCard);

const createStyles = (
  colors: ThemeColors,
  fontFamily: ThemeFontFamily,
  fontSize: ThemeFontSize,
  isDark: boolean,
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
      fontSize: fontSize.caption,
      marginTop: verticalScale(2),
    },
    rightAction: {
      justifyContent: "center",
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
    deleteBtn: {
      padding: scale(6),
    },
  });
