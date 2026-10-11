import { useMemo } from "react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useDownloadsStore } from "@/store/downloadsStore";
import { Chapter, FavoriteVerse } from "@/types";

export type TabValue = "favorites" | "downloads";

export function useLibraryData() {
  const favoriteVerses = useFavoritesStore((state) => state.favoriteVerses);
  const downloadedMap = useDownloadsStore((s) => s.downloads);

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

  return {
    favoriteVerses,
    downloadedChapters,
  };
}

