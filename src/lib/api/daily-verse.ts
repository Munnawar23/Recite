import { quranApiClient } from "./client";
import { TRANSLATION_IDS } from "@/constants";

export { TRANSLATION_IDS };

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
  const translation = rawTranslation
    .replace(/<sup[^>]*>.*?<\/sup>/g, "") // Remove <sup> footnote tags
    .replace(/<[^>]+>/g, "") // Remove any remaining HTML tags
    .replace(/\s*sup\s*\d+\s*/gi, "") // Remove leftover "sup 1" text patterns
    .replace(/(\D)\d+(\s*[,।॥\.\?!\)]|$)/g, "$1$2") // Remove orphan footnote numbers before punctuation/end of sentence
    .replace(/\s{2,}/g, " ") // Normalize spaces
    .trim();

  return {
    arabic: verse.text_uthmani,
    translation,
    source: `Surah ${verse.verse_key}`,
  };
};
