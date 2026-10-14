import ar from "./translations/ar.json";
import bn from "./translations/bn.json";
import en from "./translations/en.json";
import fa from "./translations/fa.json";
import fr from "./translations/fr.json";
import hi from "./translations/hi.json";
import indonesia from "./translations/id.json";
import ms from "./translations/ms.json";
import ru from "./translations/ru.json";
import tr from "./translations/tr.json";
import ur from "./translations/ur.json";

export const DEFAULT_LANGUAGE = "en";

export const resources = Object.freeze({
  en: { translation: en },
  ar: { translation: ar },
  ur: { translation: ur },
  hi: { translation: hi },
  id: { translation: indonesia },
  bn: { translation: bn },
  ms: { translation: ms },
  ru: { translation: ru },
  tr: { translation: tr },
  fr: { translation: fr },
  fa: { translation: fa },
} as const);

export const SUPPORTED_LANGUAGES = Object.freeze([
  { code: "en", label: "English", isRTL: false },
  { code: "ar", label: "العربية", isRTL: true },
  { code: "ur", label: "اردو", isRTL: true },
  { code: "hi", label: "हिन्दी", isRTL: false },
  { code: "id", label: "Bahasa Indonesia", isRTL: false },
  { code: "bn", label: "বাংলা", isRTL: false },
  { code: "ms", label: "Bahasa Melayu", isRTL: false },
  { code: "ru", label: "Русский", isRTL: false },
  { code: "tr", label: "Türkçe", isRTL: false },
  { code: "fr", label: "Français", isRTL: false },
  { code: "fa", label: "فارسی", isRTL: true },
] as const);

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const SUPPORTED_LANGUAGE_CODES = Object.freeze(Object.keys(resources) as SupportedLanguageCode[]);

export const isSupportedLanguage = (lng: string): lng is SupportedLanguageCode => {
  return lng in resources;
};

/** Helper to retrieve language metadata object by code */
export const getLanguage = (code: SupportedLanguageCode) => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) ?? SUPPORTED_LANGUAGES[0];
};
