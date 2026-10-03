import {
  SectionTitle,
  DeleteConfirmationModal,
  MessageModal,
} from "@/components";
import SettingsItemCard from "./SettingsItemCard";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { deleteChapterDownload } from "@/services/downloadService";
import { Haptics } from "@/lib/haptics";
import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

function formatMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function StorageSection() {
  const { t } = useTranslation();

  // ─── Downloads store ────────────────────────────────────────────────────────
  const downloads = useDownloadsStore((s) => s.downloads);
  const removeDownload = useDownloadsStore((s) => s.removeDownload);

  const downloadStats = useMemo(() => {
    const entries = Object.values(downloads);
    const count = entries.length;
    const totalBytes = entries.reduce((sum, d) => sum + (d.totalBytes || 0), 0);
    return { count, totalBytes, sizeMB: formatMB(totalBytes) };
  }, [downloads]);

  // ─── Favorites store ────────────────────────────────────────────────────────
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const favCount = favoriteIds.length;

  // ─── Modal states ───────────────────────────────────────────────────────────
  const [deleteDownloadsVisible, setDeleteDownloadsVisible] = useState(false);
  const [deleteFavoritesVisible, setDeleteFavoritesVisible] = useState(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: "", message: "" });

  // ─── Clear Downloads ────────────────────────────────────────────────────────
  const handleClearDownloadsPress = useCallback(() => {
    if (downloadStats.count === 0) {
      setInfoModal({
        visible: true,
        title: t("settings.storage.noDownloadsTitle", "No Downloads"),
        message: t(
          "settings.storage.noDownloadsMessage",
          "You don't have any downloaded Surahs to clear.",
        ),
      });
      return;
    }
    Haptics.medium();
    setDeleteDownloadsVisible(true);
  }, [downloadStats.count, t]);

  const handleConfirmClearDownloads = useCallback(async () => {
    setDeleteDownloadsVisible(false);
    // Delete all files from disk
    const chapterIds = Object.keys(downloads).map(Number);
    await Promise.all(chapterIds.map((id) => deleteChapterDownload(id)));
    // Clear store
    chapterIds.forEach((id) => removeDownload(id));
    Haptics.success();
  }, [downloads, removeDownload]);

  // ─── Clear Favorites ────────────────────────────────────────────────────────
  const handleClearFavoritesPress = useCallback(() => {
    if (favCount === 0) {
      setInfoModal({
        visible: true,
        title: t("settings.storage.noFavoritesTitle", "No Favorites"),
        message: t(
          "settings.storage.noFavoritesMessage",
          "You don't have any favorite Surahs to clear.",
        ),
      });
      return;
    }
    Haptics.medium();
    setDeleteFavoritesVisible(true);
  }, [favCount, t]);

  const handleConfirmClearFavorites = useCallback(() => {
    setDeleteFavoritesVisible(false);
    // Toggle each fav to remove (toggleFavorite removes if exists)
    favoriteIds.forEach((id) => useFavoritesStore.getState().toggleFavorite(id));
    Haptics.success();
  }, [favoriteIds]);

  // ─── Dynamic subtitles ─────────────────────────────────────────────────────
  const downloadsSubtitle =
    downloadStats.count > 0
      ? t("settings.storage.clearDownloadsSubtitle", {
          count: downloadStats.count,
          size: `${downloadStats.sizeMB} MB`,
        })
      : t(
          "settings.storage.clearDownloadsSubtitleEmpty",
          "0 Surah(s) saved offline (0 MB)",
        );

  const favoritesSubtitle = t("settings.storage.clearFavoritesSubtitle", {
    count: favCount,
  });

  return (
    <>
      <SectionTitle
        label={t("settings.sections.storage", "Storage")}
        icon="server-outline"
        tightSpacing
      />
      <SettingsItemCard
        icon="cloud-offline-outline"
        iconColor="#E53E3E"
        title={t("settings.storage.clearDownloadsTitle", "Clear All Downloads")}
        subtitle={downloadsSubtitle}
        onPress={handleClearDownloadsPress}
      />
      <SettingsItemCard
        icon="heart-dislike-outline"
        iconColor="#E53E3E"
        title={t("settings.storage.clearFavoritesTitle", "Clear All Favorites")}
        subtitle={favoritesSubtitle}
        onPress={handleClearFavoritesPress}
      />

      {/* Delete Downloads Confirmation */}
      <DeleteConfirmationModal
        visible={deleteDownloadsVisible}
        title={t(
          "settings.storage.confirmClearDownloadsTitle",
          "Clear All Downloads?",
        )}
        description={t(
          "settings.storage.confirmClearDownloadsDesc",
          {
            count: downloadStats.count,
            size: `${downloadStats.sizeMB} MB`,
          },
        )}
        onConfirm={handleConfirmClearDownloads}
        onCancel={() => setDeleteDownloadsVisible(false)}
        confirmText={t("common.remove", "Remove")}
        cancelText={t("common.cancel", "Cancel")}
      />

      {/* Delete Favorites Confirmation */}
      <DeleteConfirmationModal
        visible={deleteFavoritesVisible}
        title={t(
          "settings.storage.confirmClearFavoritesTitle",
          "Clear All Favorites?",
        )}
        description={t(
          "settings.storage.confirmClearFavoritesDesc",
          { count: favCount },
        )}
        onConfirm={handleConfirmClearFavorites}
        onCancel={() => setDeleteFavoritesVisible(false)}
        confirmText={t("common.remove", "Remove")}
        cancelText={t("common.cancel", "Cancel")}
      />

      {/* Info modal for empty states */}
      <MessageModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        icon="information-circle-outline"
      />
    </>
  );
}
