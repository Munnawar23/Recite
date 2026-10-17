import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";

const PROGRESS_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AudioProgress {
  chapterId: number;
  position: number;       // seconds into the audio
  duration: number;       // total track duration in seconds
  audioLanguage: string;  // "en" | "ar"
  reciterId: number | string; // arabic reciter id or english edition name
  savedAt: number;        // Date.now() timestamp for expiry checks
}

// Key format: `${chapterId}_${audioLanguage}_${reciterId}`
export const getAudioProgressKey = (
  chapterId: number,
  audioLanguage: string,
  reciterId: number | string,
) => `${chapterId}_${audioLanguage}_${reciterId}`;

interface AudioProgressState {
  // Map of chapter progress records keyed by `${chapterId}_${audioLanguage}_${reciterId}`
  progressByChapter: Record<string, AudioProgress>;
  saveProgress: (p: AudioProgress) => void;
  clearProgress: (chapterId?: number, audioLanguage?: string, reciterId?: number | string) => void;
}

export const useAudioProgressStore = create<AudioProgressState>()(
  persist(
    (set) => ({
      progressByChapter: {},
      saveProgress: (p) =>
        set((state) => {
          if (!p || p.position <= 0 || p.duration <= 0 || !p.chapterId) {
            return state;
          }
          const key = getAudioProgressKey(p.chapterId, p.audioLanguage, p.reciterId);
          return {
            progressByChapter: {
              ...state.progressByChapter,
              [key]: p,
            },
          };
        }),
      clearProgress: (chapterId, audioLanguage, reciterId) =>
        set((state) => {
          if (chapterId && audioLanguage && reciterId) {
            const key = getAudioProgressKey(chapterId, audioLanguage, reciterId);
            if (!state.progressByChapter[key]) return state;
            const updated = { ...state.progressByChapter };
            delete updated[key];
            return { progressByChapter: updated };
          }
          return { progressByChapter: {} };
        }),
    }),
    {
      name: STORAGE_KEYS.AUDIO_PROGRESS,
      storage: createJSONStorage(() => zustandStorage),
      // On rehydration, purge expired entries
      onRehydrateStorage: () => (state) => {
        if (!state?.progressByChapter) return;
        const now = Date.now();
        let changed = false;
        const updated = { ...state.progressByChapter };

        for (const [key, item] of Object.entries(updated)) {
          if (!item?.savedAt || now - item.savedAt > PROGRESS_EXPIRY_MS) {
            delete updated[key];
            changed = true;
          }
        }

        if (changed) {
          useAudioProgressStore.setState({ progressByChapter: updated });
        }
      },
    },
  ),
);

/**
 * Access progress for a specific chapter, language, and reciter.
 */
export const getAudioProgress = (
  chapterId?: number,
  audioLanguage?: string,
  reciterId?: number | string,
): AudioProgress | null => {
  const store = useAudioProgressStore.getState();
  if (!chapterId || !audioLanguage || !reciterId) {
    // If no specific key passed, return latest saved progress or null
    const all = Object.values(store.progressByChapter);
    if (all.length === 0) return null;
    return all.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))[0] ?? null;
  }
  const key = getAudioProgressKey(chapterId, audioLanguage, reciterId);
  return store.progressByChapter[key] ?? null;
};

export const saveAudioProgress = (p: AudioProgress) =>
  useAudioProgressStore.getState().saveProgress(p);

export const clearAudioProgress = (
  chapterId?: number,
  audioLanguage?: string,
  reciterId?: number | string,
) => useAudioProgressStore.getState().clearProgress(chapterId, audioLanguage, reciterId);
