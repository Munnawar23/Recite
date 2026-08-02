import { useQuery } from "@tanstack/react-query";
import { getChapters } from "@/lib/api/chapters";
import { Chapter } from "@/types/quran";

const QUERY_KEYS = {
  chapters: ["quranData", "chapters"] as const,
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useQuranChapters() {
  const {
    data: chapters = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Chapter[]>({
    queryKey: QUERY_KEYS.chapters,
    queryFn: getChapters,
    staleTime: ONE_WEEK_MS,
    gcTime: ONE_WEEK_MS,
    retry: 2,
  });

  return {
    chapters,
    isLoading,
    isError,
    refetch,
  };
}
