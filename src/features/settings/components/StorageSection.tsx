import DeleteConfirmationModal from "@/components/ui/DeleteConfirmationModal";
import MessageModal from "@/components/ui/MessageModal";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsItemCard from "@/components/ui/SettingsItemCard";
import { useTranslation } from "react-i18next";
import { useStorageSection } from "../hooks/useStorageSection";

export default function StorageSection() {
  const { t } = useTranslation();
  const {
    favoriteCount,
    storageSubtitle,
    handleClearDownloads,
    handleClearFavorites,
    infoModal,
    deleteModal,
    closeInfoModal,
    closeDeleteModal,
  } = useStorageSection();

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
        subtitle={storageSubtitle}
        onPress={handleClearDownloads}
      />
      <SettingsItemCard
        icon="heart-dislike-outline"
        iconColor="#E53E3E"
        title={t("settings.storage.clearFavoritesTitle", "Clear All Favorites")}
        subtitle={t(
          "settings.storage.clearFavoritesSubtitle",
          "{{count}} Surah(s) saved in favorites",
          { count: favoriteCount },
        )}
        onPress={handleClearFavorites}
      />

      <DeleteConfirmationModal
        visible={deleteModal.visible}
        title={deleteModal.title}
        description={deleteModal.description || ""}
        onConfirm={deleteModal.onConfirm || (() => {})}
        onCancel={closeDeleteModal}
      />

      <MessageModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message || ""}
        onClose={closeInfoModal}
        icon="information-circle-outline"
      />
    </>
  );
}
