import { useMemo } from "react";
import { useQuranListSearch } from "@/features/quran/hooks/useQuranListSearch";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export type TabValue = "favorites" | "downloads";

export function useLibrary(activeTab: TabValue) {
  const { chapters, isError, refetch } = useQuranListSearch();
  const { favoriteIds } = useFavoritesStore();
  const { downloadedChapters } = useDownloadsStore();

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const favoriteChapters = useMemo(
    () => chapters.filter((ch) => favoriteIdSet.has(ch.id)),
    [chapters, favoriteIdSet],
  );

  const downloadedChapterList = useMemo(() => {
    const downloadedIds = new Set(
      Object.keys(downloadedChapters).map((id) => Number(id)),
    );
    return chapters.filter((ch) => downloadedIds.has(ch.id));
  }, [chapters, downloadedChapters]);

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
