import { useQuery } from "@tanstack/react-query";
import { getChapters } from "@/lib/api/quran-list";

export function useQuranData() {
  return useQuery({
    queryKey: ["quranData", "chapters"],
    queryFn: () => getChapters(),
    staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week cache
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}
