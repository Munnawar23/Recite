import {
  DEFAULT_RECITER_ID,
  DEFAULT_TRANSLATION_ID_STRING,
} from "@/constants";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface QuranSettingsState {
  translationId: string;
  reciterId: number;
  audioLanguage: string;
  setTranslationId: (id: string) => void;
  setReciterId: (id: number) => void;
  setAudioLanguage: (lang: string) => void;
}

export const useQuranSettingsStore = create<QuranSettingsState>()(
  persist(
    (set) => ({
      translationId: DEFAULT_TRANSLATION_ID_STRING,
      reciterId: DEFAULT_RECITER_ID,
      audioLanguage: "en",
      setTranslationId: (id) => set({ translationId: id }),
      setReciterId: (id) => set({ reciterId: id }),
      setAudioLanguage: (lang) => set({ audioLanguage: lang }),
    }),
    {
      name: STORAGE_KEYS.QURAN_SETTINGS,
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
