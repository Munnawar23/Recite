import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import type { FavoriteVerse } from "@/types";

interface FavoritesState {
  favoriteVerses: FavoriteVerse[];
  favoriteIds?: number[];
  toggleFavoriteVerse: (verse: Omit<FavoriteVerse, "addedAt">) => boolean;
  isFavoriteVerse: (verseKey: string) => boolean;
  removeFavoriteVerse: (verseKey: string) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteVerses: [],
      favoriteIds: [],
      isFavoriteVerse: (verseKey: string) => {
        return get().favoriteVerses.some((v) => v.verseKey === verseKey);
      },
      toggleFavoriteVerse: (verse) => {
        const { favoriteVerses } = get();
        const exists = favoriteVerses.some((v) => v.verseKey === verse.verseKey);
        if (exists) {
          set({
            favoriteVerses: favoriteVerses.filter((v) => v.verseKey !== verse.verseKey),
          });
          return false;
        } else {
          set({
            favoriteVerses: [
              { ...verse, addedAt: Date.now() },
              ...favoriteVerses,
            ],
          });
          return true;
        }
      },
      removeFavoriteVerse: (verseKey: string) => {
        const { favoriteVerses } = get();
        set({
          favoriteVerses: favoriteVerses.filter((v) => v.verseKey !== verseKey),
        });
      },
      clearFavorites: () => {
        set({ favoriteVerses: [], favoriteIds: [] });
      },
    }),
    {
      name: STORAGE_KEYS.FAVORITES,
      storage: createJSONStorage(() => zustandStorage),
      version: 2,
      migrate: (persisted: any, fromVersion: number) => {
        if (fromVersion < 2) {
          return {
            favoriteVerses: Array.isArray(persisted?.favoriteVerses)
              ? persisted.favoriteVerses
              : [],
          };
        }
        return persisted as FavoritesState;
      },
    }
  )
);

