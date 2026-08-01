import { useQuery } from "@tanstack/react-query";
import { getChapters } from "@/lib/api/quran-list";
import { Chapter } from "@/types/quran";

export const QUERY_KEYS = {
  chapters: ["quranData", "chapters"] as const,
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useQuranData() {
  return useQuery<Chapter[]>({
    queryKey: QUERY_KEYS.chapters,
    queryFn: getChapters,
    staleTime: ONE_WEEK_MS,
    gcTime: ONE_WEEK_MS,
    retry: 2,
  });
}
