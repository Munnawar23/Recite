import { useQuery } from "@tanstack/react-query";
import { getVersesByChapter } from "@/lib/api";
import { getLocalTextData } from "@/services/downloadService";
import { useDownloadsStore } from "@/store/downloadsStore";
import type { SurahVerse } from "@/types";

export function useSurahDetail(chapterId: number, translationId: number) {
  return useQuery<SurahVerse[]>({
    queryKey: ["surah-detail", chapterId, translationId],
    queryFn: () => getVersesByChapter(chapterId, translationId),
    enabled: !!chapterId && chapterId > 0 && !!translationId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in AsyncStorage persistence
  });
}

export function useActiveQuranDetail(type: "chapters", id: number, translationId: number) {
  const isDownloaded = useDownloadsStore((s) => s.isDownloaded(id));

  return useQuery<SurahVerse[]>({
    queryKey: ["quran-detail", type, id, translationId, isDownloaded],
    queryFn: async () => {
      // If downloaded, serve from local file — works fully offline
      if (isDownloaded) {
        const localData = await getLocalTextData(id);
        if (localData?.translations) {
          // Try exact translation match, then fall back to any available translation
          const verses =
            localData.translations[translationId] ??
            Object.values(localData.translations)[0] ??
            [];
          if (verses.length > 0) return verses as SurahVerse[];
        }
      }
      // Not downloaded (or local file missing) — fetch from network
      return getVersesByChapter(id, translationId);
    },
    enabled: !!id && id > 0 && !!translationId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in AsyncStorage persistence
  });
}
