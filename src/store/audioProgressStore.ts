import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";

export interface ChapterAudioProgress {
  chapterId: number;
  position: number; // in seconds
  duration: number; // in seconds
  updatedAt: number; // timestamp ms
}

interface AudioProgressState {
  progress: Record<number, ChapterAudioProgress>;
  saveProgress: (chapterId: number, position: number, duration: number) => void;
  getProgress: (chapterId: number) => number;
  clearProgress: (chapterId: number) => void;
}

export const useAudioProgressStore = create<AudioProgressState>()(
  persist(
    (set, get) => ({
      progress: {},

      saveProgress: (chapterId: number, position: number, duration: number) => {
        if (!chapterId || chapterId < 1) return;

        // Reset if track reached end or within last 3 seconds
        if (duration > 0 && position >= duration - 3) {
          set((state) => ({
            progress: {
              ...state.progress,
              [chapterId]: {
                chapterId,
                position: 0,
                duration,
                updatedAt: Date.now(),
              },
            },
          }));
          return;
        }

        // Only save meaningful progress
        if (position >= 1) {
          set((state) => ({
            progress: {
              ...state.progress,
              [chapterId]: {
                chapterId,
                position: Math.round(position * 10) / 10,
                duration: Math.round((duration || 0) * 10) / 10,
                updatedAt: Date.now(),
              },
            },
          }));
        }
      },

      getProgress: (chapterId: number): number => {
        const item = get().progress[chapterId];
        if (!item || !item.position) return 0;
        // If near end or finished, start at 0
        if (item.duration > 0 && item.position >= item.duration - 3) {
          return 0;
        }
        if (item.position < 2) {
          return 0;
        }
        return item.position;
      },

      clearProgress: (chapterId: number) => {
        set((state) => {
          if (!state.progress[chapterId]) return state;
          const next = { ...state.progress };
          delete next[chapterId];
          return { progress: next };
        });
      },
    }),
    {
      name: STORAGE_KEYS.AUDIO_PROGRESS,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
