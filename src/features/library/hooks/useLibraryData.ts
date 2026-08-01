import { useMemo } from "react";
import { useQuranList } from "@/features/quran/hooks/useQuranList";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export type TabValue = "favorites" | "downloads";

export function useLibraryData(activeTab: TabValue) {
  const { chapters, isError, refetch } = useQuranList();

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const downloadedChapters = useDownloadsStore((state) => state.downloadedChapters);

  const favoriteIdSet = useMemo(
    () => new Set(favoriteIds),
    [favoriteIds],
  );

  const favoriteChapters = useMemo(
    () => chapters.filter((ch) => favoriteIdSet.has(ch.id)),
    [chapters, favoriteIdSet],
  );

  const downloadedIdSet = useMemo(
    () => new Set(Object.keys(downloadedChapters).map(Number)),
    [downloadedChapters],
  );

  const downloadedChapterList = useMemo(
    () => chapters.filter((ch) => downloadedIdSet.has(ch.id)),
    [chapters, downloadedIdSet],
  );

  const listData = useMemo(
    () => (activeTab === "favorites" ? favoriteChapters : downloadedChapterList),
    [activeTab, favoriteChapters, downloadedChapterList],
  );

  return {
    listData,
    isError,
    refetch,
  };
}
