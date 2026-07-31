import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "@/lib/storage/appStorage";

interface LastRead {
  surahNumber: number;
  surahName: string;  // English name, e.g. "Al-Fatihah"
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
      name: "reading-progress-storage",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate(persistedState: unknown, fromVersion: number): ReadingProgressState {
        const state = persistedState as Partial<ReadingProgressState>;
        if (fromVersion < 1) {
          // v0 → v1: scrollOffset was not persisted — default it to 0
          if (state.lastRead && state.lastRead.scrollOffset === undefined) {
            (state.lastRead as LastRead).scrollOffset = 0;
          }
        }
        return {
          lastRead: state.lastRead ?? null,
          setLastRead: () => {},
          setScrollOffset: () => {},
          setVerseNumber: () => {},
          clearLastRead: () => {},
        };
      },
    },
  ),
);
