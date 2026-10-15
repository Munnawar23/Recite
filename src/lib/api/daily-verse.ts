import { quranApiClient } from "./client";
import { TRANSLATION_IDS } from "@/constants";

export { TRANSLATION_IDS };

const cleanTranslation = (text: string = "") =>
  text
    .replace(/<sup[^>]*>.*?<\/sup>/g, "") // Remove <sup> footnote tags
    .replace(/<[^>]+>/g, "") // Remove any remaining HTML tags
    .replace(/\s*sup\s*\d+\s*/gi, "") // Remove leftover "sup 1" text patterns
    .replace(/(\D)\d+(\s*[,।॥\.\?!\)]|$)/g, "$1$2") // Remove orphan footnote numbers before punctuation/end of sentence
    .replace(/\s{2,}/g, " ") // Normalize spaces
    .trim();

export interface DailyVerseMultiLang {
  arabic: string;
  source: string;
  translations: Record<string, string>;
}

export const getRandomVerseWithAllTranslations = async (): Promise<DailyVerseMultiLang> => {
  const translationIds = Array.from(new Set(Object.values(TRANSLATION_IDS)));
  const { data } = await quranApiClient.get(
    `/verses/random?translations=${translationIds.join(",")}&fields=text_uthmani`,
  );
  const verse = data.verse;

  const translationMap = new Map<number, string>();
  for (const t of verse.translations || []) {
    translationMap.set(t.resource_id, cleanTranslation(t.text));
  }

  const defaultTranslation = translationMap.get(TRANSLATION_IDS.en) || "";
  const translations: Record<string, string> = {};
  for (const [langCode, id] of Object.entries(TRANSLATION_IDS)) {
    translations[langCode] = translationMap.get(id) || defaultTranslation;
  }

  return {
    arabic: verse.text_uthmani,
    source: `Surah ${verse.verse_key}`,
    translations,
  };
};

export const getRandomVerse = async (
  lang: string = "en",
  customTranslationId?: string,
) => {
  let translationId = TRANSLATION_IDS[lang] || TRANSLATION_IDS.en;

  if (customTranslationId && customTranslationId !== "0") {
    const parsed = parseInt(customTranslationId, 10);
    if (!isNaN(parsed) && parsed > 0) {
      translationId = parsed;
    }
  }

  const { data } = await quranApiClient.get(
    `/verses/random?language=${lang}&translations=${translationId}&fields=text_uthmani`,
  );
  const verse = data.verse;
  const rawTranslation = verse.translations?.[0]?.text || "";
  const translation = cleanTranslation(rawTranslation);

  return {
    arabic: verse.text_uthmani,
    translation,
    source: `Surah ${verse.verse_key}`,
  };
};
