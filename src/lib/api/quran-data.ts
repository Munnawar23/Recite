import { quranApiClient } from "./client";
import { Chapter, SurahVerse } from "@/types/quran";

export const getChapters = async (): Promise<Chapter[]> => {
  const { data } = await quranApiClient.get("/chapters?language=en");
  return (data.chapters || []).map((ch: any) => ({
    id: ch.id,
    name: ch.name_arabic,
    englishName: ch.name_simple,
    englishTranslation: ch.translated_name?.name || "",
    type: ch.revelation_place === "makkah" ? "meccan" : "medinan",
    versesCount: ch.verses_count,
  }));
};

export const getVersesByChapter = async (
  chapterId: number,
  translationId: number = 20
): Promise<SurahVerse[]> => {
  const { data } = await quranApiClient.get(
    `/verses/by_chapter/${chapterId}?language=en&translations=${translationId}&fields=text_uthmani&per_page=300`
  );
  return (data.verses || []).map((v: any) => {
    const translationObj =
      v.translations?.find((t: any) => t.resource_id === translationId) ||
      v.translations?.[0];
    return {
      id: v.id,
      verseKey: v.verse_key,
      verseNumber: v.verse_number,
      arabic: v.text_uthmani,
      translation: translationObj?.text?.replace(/<[^>]+>/g, "") || "",
    };
  });
};

export const getChapterAudio = async (chapterId: number, reciterId: number = 7) => {
  const { data } = await quranApiClient.get(
    `/chapter_recitations/${reciterId}/${chapterId}?segments=true`
  );
  return data.audio_file;
};

export const searchQuran = async (query: string) => {
  if (!query || query.trim() === "") return [];
  const { data } = await quranApiClient.get(
    `/search?query=${encodeURIComponent(query)}&size=20`
  );
  return (data.search?.results || []).map((v: any) => ({
    id: v.verse_id,
    name: v.text,
    englishName: `Verse ${v.verse_key}`,
    englishTranslation: v.translations?.[0]?.text?.replace(/<[^>]+>/g, "") || "",
    type: "Search Result",
    versesCount: 0,
  }));
};
