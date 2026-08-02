import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";

interface FavoritesState {
  favoriteIds: number[];
  toggleFavorite: (id: number) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id) => {
        const { favoriteIds } = get();
        if (favoriteIds.includes(id)) {
          set({ favoriteIds: favoriteIds.filter((favId) => favId !== id) });
        } else {
          set({ favoriteIds: [...favoriteIds, id] });
        }
      },
    }),
    {
      name: STORAGE_KEYS.FAVORITES,
      storage: createJSONStorage(() => zustandStorage),
      // Bump `version` whenever the state shape changes.
      // Add a case in `migrate` to transform old data safely.
      version: 1,
      migrate: (persisted: any, fromVersion: number) => {
        if (fromVersion < 1) {
          // v0 → v1: ensure favoriteIds is always a clean number array
          return {
            favoriteIds: Array.isArray(persisted?.favoriteIds)
              ? persisted.favoriteIds.filter(
                  (id: any) => typeof id === "number",
                )
              : [],
          };
        }
        return persisted as FavoritesState;
      },
    }
  )
);

