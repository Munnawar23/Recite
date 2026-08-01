import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { DownloadedChapter, useDownloadsStore } from "@/store/downloadsStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Haptics } from "@/lib/haptics";

export interface ModalConfig {
  visible: boolean;
  title: string;
  message?: string;
  description?: string;
  onConfirm?: () => void;
}

export function useStorageSection() {
  const { t } = useTranslation();

  const downloadedChapters = useDownloadsStore((state) => state.downloadedChapters);
  const deleteChapter = useDownloadsStore((state) => state.deleteChapter);

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [infoModal, setInfoModal] = useState<ModalConfig>({
    visible: false,
    title: "",
    message: "",
  });

  const [deleteModal, setDeleteModal] = useState<ModalConfig>({
    visible: false,
    title: "",
    description: "",
    onConfirm: undefined,
  });

  const closeInfoModal = useCallback(() => {
    setInfoModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal((prev) => ({ ...prev, visible: false }));
  }, []);

  // De-duplicate downloaded records by localAudioUri/reciter to avoid double-counting legacy keys
  const chapterList = useMemo(() => {
    return Object.values(downloadedChapters).reduce(
      (acc: DownloadedChapter[], ch: DownloadedChapter) => {
        if (
          !acc.some(
            (item) =>
              (ch.localAudioUri && item.localAudioUri === ch.localAudioUri) ||
              (item.chapterId === ch.chapterId && item.reciterId === ch.reciterId),
          )
        ) {
          acc.push(ch);
        }
        return acc;
      },
      [],
    );
  }, [downloadedChapters]);

  const { totalMb, formattedSize } = useMemo(() => {
    const mb = chapterList.reduce((acc, ch) => {
      if (ch.fileSizeBytes) {
        return acc + ch.fileSizeBytes / (1024 * 1024);
      }
      if (ch.fileSize) {
        const match = ch.fileSize.match(/([\d.]+)/);
        if (match) return acc + parseFloat(match[1]);
      }
      return acc;
    }, 0);

    const formatted =
      mb >= 1024 ? (mb / 1024).toFixed(1) + " GB" : mb.toFixed(1) + " MB";

    return { totalMb: mb, formattedSize: formatted };
  }, [chapterList]);

  const storageSubtitle = useMemo(() => {
    return chapterList.length === 0
      ? t("settings.storage.clearDownloadsSubtitleEmpty", "0 Surah(s) saved offline (0 MB)")
      : t(
          "settings.storage.clearDownloadsSubtitle",
          "{{count}} Surah(s) saved ({{size}})",
          {
            count: chapterList.length,
            size: formattedSize,
          },
        );
  }, [chapterList.length, formattedSize, t]);

  const handleClearDownloads = useCallback(() => {
    Haptics.medium();
    const uniqueChapterIds = Array.from(
      new Set(chapterList.map((ch) => ch.chapterId)),
    );

    if (uniqueChapterIds.length === 0) {
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

    setDeleteModal({
      visible: true,
      title: t("settings.storage.confirmClearDownloadsTitle", "Clear All Downloads?"),
      description: t(
        "settings.storage.confirmClearDownloadsDesc",
        "Are you sure you want to remove {{count}} downloaded Surah(s) ({{size}}) from offline storage?",
        { count: uniqueChapterIds.length, size: formattedSize },
      ),
      onConfirm: async () => {
        Haptics.medium();
        // Delete all downloaded chapters in parallel
        await Promise.all(uniqueChapterIds.map((id) => deleteChapter(id)));
        closeDeleteModal();
        Toast.show({
          type: "success",
          text1: t("settings.storage.toastClearedDownloadsTitle", "Cleared Downloads"),
          text2: t(
            "settings.storage.toastClearedDownloadsDesc",
            "All downloaded Surahs have been cleared.",
          ),
        });
      },
    });
  }, [chapterList, formattedSize, t, deleteChapter, closeDeleteModal]);

  const handleClearFavorites = useCallback(() => {
    Haptics.medium();
    if (favoriteIds.length === 0) {
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

    setDeleteModal({
      visible: true,
      title: t("settings.storage.confirmClearFavoritesTitle", "Clear All Favorites?"),
      description: t(
        "settings.storage.confirmClearFavoritesDesc",
        "Are you sure you want to remove {{count}} favorite Surah(s) from your list?",
        { count: favoriteIds.length },
      ),
      onConfirm: () => {
        Haptics.medium();
        [...favoriteIds].forEach((id) => toggleFavorite(id));
        closeDeleteModal();
        Toast.show({
          type: "success",
          text1: t("settings.storage.toastClearedFavoritesTitle", "Cleared Favorites"),
          text2: t(
            "settings.storage.toastClearedFavoritesDesc",
            "All favorite Surahs have been removed.",
          ),
        });
      },
    });
  }, [favoriteIds, t, toggleFavorite, closeDeleteModal]);

  return {
    favoriteCount: favoriteIds.length,
    storageSubtitle,
    handleClearDownloads,
    handleClearFavorites,
    infoModal,
    deleteModal,
    closeInfoModal,
    closeDeleteModal,
  };
}
