import * as Localization from "expo-localization";
import { ModuleType } from "i18next";
import { appStorage, STORAGE_KEYS } from "@/lib/storage/appStorage";
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  SupportedLanguageCode,
} from "./constants";

export const languageDetector = {
  type: "languageDetector" as ModuleType,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await appStorage.getItem<string>(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage && isSupportedLanguage(savedLanguage)) {
        return callback(savedLanguage);
      }

      // Fallback to device locale if no saved preference
      const deviceLanguage = Localization.getLocales()?.[0]?.languageCode ?? DEFAULT_LANGUAGE;
      const fallbackLanguage = isSupportedLanguage(deviceLanguage)
        ? deviceLanguage
        : DEFAULT_LANGUAGE;

      callback(fallbackLanguage);
    } catch (e) {
      console.error("[languageDetector] Error detecting language:", e);
      callback(DEFAULT_LANGUAGE);
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: SupportedLanguageCode) => {
    try {
      await appStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);
    } catch (e) {
      console.error("[languageDetector] Error caching language:", e);
    }
  },
};
