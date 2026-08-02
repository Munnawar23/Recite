import { useMemo } from "react";
import { useQuranChapters } from "@/features/quran/hooks/useQuranChapters";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useDownloadsStore } from "@/store/downloadsStore";

export type TabValue = "favorites" | "downloads";

export function useLibraryData(activeTab: TabValue) {
  const { chapters, isError, refetch } = useQuranChapters();

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const downloadedMap = useDownloadsStore((s) => s.downloads);
  const downloadedIds = useMemo(() => Object.keys(downloadedMap).map(Number), [downloadedMap]);

  const favoriteIdSet = useMemo(
    () => new Set(favoriteIds),
    [favoriteIds],
  );

  const downloadedIdSet = useMemo(
    () => new Set(downloadedIds),
    [downloadedIds],
  );

  const favoriteChapters = useMemo(
    () => chapters.filter((ch) => favoriteIdSet.has(ch.id)),
    [chapters, favoriteIdSet],
  );

  const downloadedChapters = useMemo(
    () => chapters.filter((ch) => downloadedIdSet.has(ch.id)),
    [chapters, downloadedIdSet],
  );

  const listData = useMemo(
    () => (activeTab === "favorites" ? favoriteChapters : downloadedChapters),
    [activeTab, favoriteChapters, downloadedChapters],
  );

  return {
    listData,
    isError,
    refetch,
  };
}


