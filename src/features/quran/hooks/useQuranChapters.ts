import { useQuery } from "@tanstack/react-query";
import { getChapters } from "@/lib/api";
import { useLanguageStore } from "@/store/languageStore";
import { Chapter } from "@/types";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useQuranChapters() {
  const language = useLanguageStore((state) => state.language);

  const {
    data: chapters = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Chapter[]>({
    queryKey: ["quranData", "chapters", language],
    queryFn: () => getChapters(language),
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
