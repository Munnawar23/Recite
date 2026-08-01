import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import MessageModal from "@/components/common/MessageModal";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Haptics } from "@/lib/haptics";

export default function StorageSection() {
  const { t } = useTranslation();
  const { downloadedChapters, deleteChapter } = useDownloadsStore();
  const { favoriteIds, toggleFavorite } = useFavoritesStore();

  const [messageModalConfig, setMessageModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const handleClearDownloads = () => {
    Haptics.medium();
    const chapterIds = Object.keys(downloadedChapters).map(Number);
    if (chapterIds.length === 0) {
      setMessageModalConfig({
        visible: true,
        title: t("settings.storage.noDownloadsTitle", "No Downloads"),
        message: t("settings.storage.noDownloadsMessage", "You don't have any downloaded Surahs to clear."),
      });
      return;
    }

    setDeleteModalConfig({
      visible: true,
      title: t("settings.storage.confirmClearDownloadsTitle", "Clear All Downloads?"),
      description: t(
        "settings.storage.confirmClearDownloadsDesc",
        "Are you sure you want to remove {{count}} downloaded Surah(s) ({{size}}) from offline storage?",
        { count: chapterIds.length, size: formattedSize }
      ),
      onConfirm: async () => {
        Haptics.medium();
        for (const id of chapterIds) {
          await deleteChapter(id);
        }
        setDeleteModalConfig((prev) => ({ ...prev, visible: false }));
        Toast.show({
          type: "success",
          text1: t("settings.storage.toastClearedDownloadsTitle", "Cleared Downloads"),
          text2: t("settings.storage.toastClearedDownloadsDesc", "All downloaded Surahs have been cleared."),
        });
      },
    });
  };

  const handleClearFavorites = () => {
    Haptics.medium();
    if (favoriteIds.length === 0) {
      setMessageModalConfig({
        visible: true,
        title: t("settings.storage.noFavoritesTitle", "No Favorites"),
        message: t("settings.storage.noFavoritesMessage", "You don't have any favorite Surahs to clear."),
      });
      return;
    }

    setDeleteModalConfig({
      visible: true,
      title: t("settings.storage.confirmClearFavoritesTitle", "Clear All Favorites?"),
      description: t(
        "settings.storage.confirmClearFavoritesDesc",
        "Are you sure you want to remove {{count}} favorite Surah(s) from your list?",
        { count: favoriteIds.length }
      ),
      onConfirm: () => {
        Haptics.medium();
        const idsCopy = [...favoriteIds];
        idsCopy.forEach((id) => toggleFavorite(id));
        setDeleteModalConfig((prev) => ({ ...prev, visible: false }));
        Toast.show({
          type: "success",
          text1: t("settings.storage.toastClearedFavoritesTitle", "Cleared Favorites"),
          text2: t("settings.storage.toastClearedFavoritesDesc", "All favorite Surahs have been removed."),
        });
      },
    });
  };

  // De-duplicate downloaded records by localAudioUri/reciter to avoid double-counting legacy keys
  const chapterList = Object.values(downloadedChapters).reduce((acc: any[], ch) => {
    if (!acc.some((item) => (ch.localAudioUri && item.localAudioUri === ch.localAudioUri) || (item.chapterId === ch.chapterId && item.reciterId === ch.reciterId))) {
      acc.push(ch);
    }
    return acc;
  }, []);

  const totalMb = chapterList.reduce((acc, ch) => {
    if (ch.fileSizeBytes) {
      return acc + ch.fileSizeBytes / (1024 * 1024);
    }
    if (ch.fileSize) {
      const match = ch.fileSize.match(/([\d.]+)/);
      if (match) return acc + parseFloat(match[1]);
    }
    return acc;
  }, 0);

  const formattedSize = totalMb >= 1024 ? (totalMb / 1024).toFixed(1) + " GB" : totalMb.toFixed(1) + " MB";

  const storageSubtitle =
    chapterList.length === 0
      ? t("settings.storage.clearDownloadsSubtitleEmpty", "0 Surah(s) saved offline (0 MB)")
      : t("settings.storage.clearDownloadsSubtitle", "{{count}} Surah(s) saved ({{size}})", {
          count: chapterList.length,
          size: formattedSize,
        });

  return (
    <>
      <SectionTitle label={t("settings.sections.storage", "Storage")} icon="server-outline" tightSpacing />
      <SettingsItemCard
        icon="cloud-offline-outline"
        iconColor="#E53E3E"
        title={t("settings.storage.clearDownloadsTitle", "Clear All Downloads")}
        subtitle={storageSubtitle}
        onPress={handleClearDownloads}
      />
      <SettingsItemCard
        icon="heart-dislike-outline"
        iconColor="#E53E3E"
        title={t("settings.storage.clearFavoritesTitle", "Clear All Favorites")}
        subtitle={t("settings.storage.clearFavoritesSubtitle", "{{count}} Surah(s) saved in favorites", {
          count: favoriteIds.length,
        })}
        onPress={handleClearFavorites}
      />

      <DeleteConfirmationModal
        visible={deleteModalConfig.visible}
        title={deleteModalConfig.title}
        description={deleteModalConfig.description}
        onConfirm={deleteModalConfig.onConfirm}
        onCancel={() => setDeleteModalConfig((prev) => ({ ...prev, visible: false }))}
      />

      <MessageModal
        visible={messageModalConfig.visible}
        title={messageModalConfig.title}
        message={messageModalConfig.message}
        onClose={() => setMessageModalConfig((prev) => ({ ...prev, visible: false }))}
        icon="information-circle-outline"
      />
    </>
  );
}
