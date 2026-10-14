import { useMemo } from "react";
import { getChapter } from "@/constants";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import { Chapter, FavoriteVerse } from "@/types";

export type TabValue = "favorites" | "downloads";

export function useLibraryData() {
  const favoriteVerses = useFavoritesStore((state) => state.favoriteVerses);
  const downloadedMap = useDownloadsStore((s) => s.downloads);
  const language = useLanguageStore((state) => state.language);

  // Build downloads list localized directly to the active language
  const downloadedChapters = useMemo((): Chapter[] => {
    return Object.values(downloadedMap)
      .sort((a, b) => a.chapterId - b.chapterId)
      .map((d) => {
        const localized = getChapter(d.chapterId, language);
        return {
          id: d.chapterId,
          name: d.chapterInfo?.name || localized.name,
          localizedName: localized.localizedName,
          localizedTranslation:
            d.chapterInfo?.localizedTranslation || localized.localizedTranslation,
          versesCount: d.chapterInfo?.versesCount || localized.versesCount,
          type: d.chapterInfo?.type || localized.type,
        };
      });
  }, [downloadedMap, language]);

  return {
    favoriteVerses,
    downloadedChapters,
  };
}

