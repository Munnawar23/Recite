import { useMemo } from "react";
import { useQuranChapters } from "@/features/quran/hooks/useQuranChapters";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { Chapter } from "@/types/quran";

export type TabValue = "favorites" | "downloads";

export function useLibraryData(activeTab: TabValue) {
  const { chapters, isError, refetch } = useQuranChapters();

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const downloadedMap = useDownloadsStore((s) => s.downloads);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const favoriteChapters = useMemo(
    () => chapters.filter((ch) => favoriteIdSet.has(ch.id)),
    [chapters, favoriteIdSet],
  );

  // Build downloads list directly from the store — no API needed, works fully offline.
  // Each DownloadedChapter stores chapterInfo saved at download time.
  const downloadedChapters = useMemo((): Chapter[] => {
    return Object.values(downloadedMap)
      .filter((d) => d.chapterInfo) // only entries that have display metadata
      .sort((a, b) => a.chapterId - b.chapterId)
      .map((d) => ({
        id: d.chapterId,
        name: d.chapterInfo!.name,
        englishName: d.chapterInfo!.englishName,
        englishTranslation: d.chapterInfo!.englishTranslation,
        versesCount: d.chapterInfo!.versesCount,
        type: d.chapterInfo!.type,
      }));
  }, [downloadedMap]);

  const listData = useMemo(
    () => (activeTab === "favorites" ? favoriteChapters : downloadedChapters),
    [activeTab, favoriteChapters, downloadedChapters],
  );

  // isError is only relevant for the favorites tab (which needs the API)
  return {
    listData,
    isError: activeTab === "favorites" ? isError : false,
    refetch,
  };
}
