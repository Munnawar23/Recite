import { useMemo } from "react";
import { useQuranList } from "@/features/quran/hooks/useQuranList";
import { useFavoritesStore } from "@/store/favoritesStore";

export type TabValue = "favorites" | "downloads";

export function useLibraryData(activeTab: TabValue) {
  const { chapters, isError, refetch } = useQuranList();

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  const favoriteIdSet = useMemo(
    () => new Set(favoriteIds),
    [favoriteIds],
  );

  const favoriteChapters = useMemo(
    () => chapters.filter((ch) => favoriteIdSet.has(ch.id)),
    [chapters, favoriteIdSet],
  );

  const staticDownloadedChapters = useMemo(
    () => chapters.slice(0, 2),
    [chapters],
  );

  const listData = useMemo(
    () => (activeTab === "favorites" ? favoriteChapters : staticDownloadedChapters),
    [activeTab, favoriteChapters, staticDownloadedChapters],
  );

  return {
    listData,
    isError,
    refetch,
  };
}

