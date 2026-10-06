import { DEFAULT_TRANSLATION_ID_STRING, TRANSLATION_OPTIONS } from "./translations";

/**
 * Localized translations of Bismillah (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ)
 * Keyed by translation ID and language code.
 */
export const BISMILLAH_TRANSLATIONS: Record<string, string> = {
  // By Translation ID
  "20": "In the name of Allah, the Most Gracious, the Most Merciful",
  "131": "In the name of Allah, the Most Gracious, the Most Merciful",
  "97": "اللہ کے نام سے جو رحمان اور رحیم ہے",
  "54": "اللہ کے نام سے جو رحمان اور رحیم ہے",
  "122": "अल्लाह के नाम से, जो बड़ा कृपाशील, अत्यंत दयावान है",
  "33": "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang",
  "39": "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani",
  "161": "আল্লাহর নামে, যিনি পরম করুণাময়, অতি দয়ালু",
  "45": "С именем Аллаха, Милостивого, Милосердного",
  "79": "С именем Аллаха, Милостивого, Милосердного",

  // By Language Code
  en: "In the name of Allah, the Most Gracious, the Most Merciful",
  ur: "اللہ کے نام سے جو رحمان اور رحیم ہے",
  hi: "अल्लाह के नाम से, जो बड़ा कृपाशील, अत्यंत दयावान है",
  id: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang",
  ms: "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani",
  bn: "আল্লাহর নামে, যিনি পরম করুণাময়, অতি দয়ালু",
  ru: "С именем Аллаха, Милостивого, Милосердного",
};

/**
 * Returns the localized Bismillah translation according to the selected translation ID or language.
 * Returns empty string if "0" (Arabic Only).
 */
export function getBismillahTranslation(translationIdOrLang?: string): string {
  if (!translationIdOrLang || translationIdOrLang === "0") {
    return "";
  }
  if (BISMILLAH_TRANSLATIONS[translationIdOrLang]) {
    return BISMILLAH_TRANSLATIONS[translationIdOrLang];
  }
  const match = TRANSLATION_OPTIONS.find((opt) => opt.value === translationIdOrLang);
  if (match?.languageCode && BISMILLAH_TRANSLATIONS[match.languageCode]) {
    return BISMILLAH_TRANSLATIONS[match.languageCode];
  }
  return (
    BISMILLAH_TRANSLATIONS[DEFAULT_TRANSLATION_ID_STRING] ||
    BISMILLAH_TRANSLATIONS.en
  );
}
