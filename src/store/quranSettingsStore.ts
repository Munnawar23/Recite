import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "@/lib/storage/appStorage";

interface QuranSettingsState {
  translationId: string;
  reciterId: number;
  setTranslationId: (id: string) => void;
  setReciterId: (id: number) => void;
}

export const useQuranSettingsStore = create<QuranSettingsState>()(
  persist(
    (set) => ({
      translationId: "20",
      reciterId: 7,
      setTranslationId: (id) => set({ translationId: id }),
      setReciterId: (id) => set({ reciterId: id }),
    }),
    {
      name: "quran-settings-storage",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
