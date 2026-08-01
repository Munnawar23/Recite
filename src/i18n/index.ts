import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  getLanguage,
  isSupportedLanguage,
  resources,
  SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
} from "./constants";
import { languageDetector } from "./languageDetector";

export {
  DEFAULT_LANGUAGE,
  getLanguage,
  isSupportedLanguage,
  resources,
  SUPPORTED_LANGUAGE_CODES,
  SUPPORTED_LANGUAGES,
  SupportedLanguageCode,
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    load: "languageOnly",
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
