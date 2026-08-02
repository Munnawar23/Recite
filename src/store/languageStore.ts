import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import i18n, { SupportedLanguageCode } from "@/i18n";

interface LanguageState {
  language: SupportedLanguageCode;
  setLanguage: (lang: SupportedLanguageCode) => void;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: (i18n.language as SupportedLanguageCode) || "en",
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      t: (key: string) => i18n.t(key),
    }),
    {
      name: STORAGE_KEYS.LANGUAGE,
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        // Sync i18n instance asynchronously after component mount to avoid unmounted React state update warning
        if (state?.language) {
          setTimeout(() => {
            i18n.changeLanguage(state.language);
          }, 0);
        }
      },
    },
  ),
);
