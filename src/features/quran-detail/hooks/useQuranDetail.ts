import { useQuery } from "@tanstack/react-query";
import { getVersesByChapter } from "@/lib/api/chapter-verses";
import type { SurahVerse } from "@/types/quran";

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
  return useQuery<SurahVerse[]>({
    queryKey: ["quran-detail", type, id, translationId],
    queryFn: () => getVersesByChapter(id, translationId),
    enabled: !!id && id > 0 && !!translationId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in AsyncStorage persistence
  });
}
