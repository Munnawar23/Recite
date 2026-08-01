import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface LastRead {
  surahNumber: number;
  surahName: string;
  arabicName: string;
  versesCount: string;
  type: string;
  verseNumber: number;
  scrollOffset: number;
}

interface ReadingProgressState {
  lastRead: LastRead | null;
  setLastRead: (data: LastRead) => void;
  setScrollOffset: (surahNumber: number, offset: number) => void;
  setVerseNumber: (surahNumber: number, verseNumber: number) => void;
  clearLastRead: () => void;
}

/**
 * Migrates persisted reading progress state safely without mutating input arguments.
 */
function migrateReadingProgress(
  persistedState: unknown,
  fromVersion: number,
): Partial<ReadingProgressState> {
  const state = (persistedState as Partial<ReadingProgressState>) || {};
  let lastRead = state.lastRead ?? null;

  if (fromVersion < 1 && lastRead) {
    // v0 → v1: Default missing scrollOffset to 0 immutably
    lastRead = {
      ...lastRead,
      scrollOffset: lastRead.scrollOffset ?? 0,
    };
  }

  return {
    lastRead,
  };
}

export const useReadingProgressStore = create<ReadingProgressState>()(
  persist(
    (set) => ({
      lastRead: null,
      setLastRead: (data) =>
        set({ lastRead: { ...data, scrollOffset: data.scrollOffset ?? 0 } }),
      setScrollOffset: (surahNumber, offset) =>
        set((state) => {
          if (state.lastRead?.surahNumber !== surahNumber) return state;
          return { lastRead: { ...state.lastRead, scrollOffset: offset } };
        }),
      setVerseNumber: (surahNumber, verseNumber) =>
        set((state) => {
          if (state.lastRead?.surahNumber !== surahNumber) return state;
          return { lastRead: { ...state.lastRead, verseNumber } };
        }),
      clearLastRead: () => set({ lastRead: null }),
    }),
    {
      name: STORAGE_KEYS.READING_PROGRESS,
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate: (persistedState, fromVersion) =>
        migrateReadingProgress(
          persistedState,
          fromVersion,
        ) as ReadingProgressState,
      partialize: (state) => ({
        lastRead: state.lastRead,
      }),
    },
  ),
);
