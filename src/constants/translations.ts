export interface TranslationOption {
  label: string;
  value: string;
  languageCode?: string;
}

export const DEFAULT_TRANSLATION_ID = 20;
export const DEFAULT_TRANSLATION_ID_STRING = "20";

/**
 * Single source of truth for all Quran translations in the app.
 * Used in dropdowns, daily verses, and offline downloads.
 */
export const TRANSLATION_OPTIONS: TranslationOption[] = [
  { label: "Arabic Only", value: "0" },
  { label: "English (Saheeh)", value: "20", languageCode: "en" },
  { label: "Urdu (Maududi)", value: "97", languageCode: "ur" },
  { label: "Hindi (Azizul Haque)", value: "122", languageCode: "hi" },
  { label: "Bahasa Indonesia (Ministry)", value: "33", languageCode: "id" },
  { label: "Bengali (Taisirul)", value: "161", languageCode: "bn" },
  { label: "Bahasa Melayu (Basmeih)", value: "39", languageCode: "ms" }, // ms = Malay
  { label: "Russian (Kuliev)", value: "45", languageCode: "ru" },
];

/**
 * Language code to translation ID lookup map (used in daily verse / widgets).
 * Automatically derived from TRANSLATION_OPTIONS so you only manage one list.
 */
export const TRANSLATION_IDS: Record<string, number> = {
  ar: DEFAULT_TRANSLATION_ID, // Fallback for Arabic UI tab
  ...Object.fromEntries(
    TRANSLATION_OPTIONS
      .filter((opt) => Boolean(opt.languageCode && opt.value !== "0"))
      .map((opt) => [opt.languageCode as string, parseInt(opt.value, 10)])
  ),
};

/**
 * All translation IDs downloaded for offline access.
 * Automatically derived from TRANSLATION_OPTIONS.
 */
export const ALL_TRANSLATION_IDS: number[] = Array.from(
  new Set([
    ...TRANSLATION_OPTIONS
      .filter((opt) => opt.value !== "0")
      .map((opt) => parseInt(opt.value, 10)),
    131, // Additional supported pack (e.g., Dr. Mustafa Khattab)
  ])
);

