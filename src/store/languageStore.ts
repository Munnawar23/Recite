import { appStorage, STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
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
        // Also persist the plain language code so languageDetector
        // can read it correctly on the next cold start / cache clear.
        appStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
        set({ language: lang });
      },
      t: (key: string) => i18n.t(key),
    }),
    {
      // Use a dedicated key so the zustand JSON blob does NOT overwrite
      // the plain-string "user-language" key read by languageDetector.
      name: STORAGE_KEYS.LANGUAGE_STORE,
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        // Sync i18n instance after rehydration so the UI immediately
        // reflects the persisted language without waiting for a re-render.
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
