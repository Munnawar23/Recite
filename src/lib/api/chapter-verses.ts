import { quranApiClient } from "./client";
import { SurahVerse } from "@/types/quran";

export const getVersesByChapter = async (
  chapterId: number,
  translationId: number = 20,
): Promise<SurahVerse[]> => {
  const { data } = await quranApiClient.get(
    `/verses/by_chapter/${chapterId}?language=en&translations=${translationId}&fields=text_uthmani&per_page=300`,
  );
  return (data.verses || []).map((v: any) => {
    const translationObj =
      v.translations?.find((t: any) => t.resource_id === translationId) ||
      v.translations?.[0];
    const rawText = translationObj?.text || "";
    const cleanTranslation = rawText
      .replace(/<sup[^>]*>.*?<\/sup>/g, "") // Remove <sup> footnote tags
      .replace(/<[^>]+>/g, "") // Remove any remaining HTML tags
      .replace(/\s*sup\s*\d+\s*/gi, "") // Remove leftover "sup 1" text patterns
      .replace(/(\D)\d+(\s*[,।॥\.\?!\)]|$)/g, "$1$2") // Remove orphan footnote numbers before punctuation/end of sentence
      .replace(/\s{2,}/g, " ") // Normalize spaces
      .trim();

    return {
      id: v.id,
      verseKey: v.verse_key,
      verseNumber: v.verse_number,
      arabic: v.text_uthmani,
      translation: cleanTranslation,
    };
  });
};
