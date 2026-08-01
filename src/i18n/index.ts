import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './translations/en.json';
import ar from './translations/ar.json';
import ur from './translations/ur.json';
import hi from './translations/hi.json';
import indonesia from './translations/id.json';
import bn from './translations/bn.json';
import { appStorage, STORAGE_KEYS } from '@/lib/storage/appStorage';

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
  ur: { translation: ur },
  hi: { translation: hi },
  id: { translation: indonesia },
  bn: { translation: bn },
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', isRTL: false },
  { code: 'ar', label: 'العربية (Arabic)', isRTL: true },
  { code: 'ur', label: 'اردو (Urdu)', isRTL: true },
  { code: 'hi', label: 'हिन्दी (Hindi)', isRTL: false },
  { code: 'id', label: 'Bahasa Indonesia', isRTL: false },
  { code: 'bn', label: 'বাংলা (Bengali)', isRTL: false },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const isSupportedLanguage = (lng: string): lng is SupportedLanguageCode => {
  return lng in resources;
};

// Language Detector Module for i18next using appStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    const savedLanguage = await appStorage.getItem<string>(STORAGE_KEYS.LANGUAGE);
    if (savedLanguage && isSupportedLanguage(savedLanguage)) {
      return callback(savedLanguage);
    }
    
    // Fallback to device locale if no saved preference
    const deviceLanguage = Localization.getLocales()?.[0]?.languageCode ?? 'en';
    const fallbackLanguage = isSupportedLanguage(deviceLanguage) ? deviceLanguage : 'en';
    callback(fallbackLanguage);
  },
  init: () => {},
  cacheUserLanguage: async (lng: SupportedLanguageCode) => {
    await appStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: Object.keys(resources),
    load: 'languageOnly',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
