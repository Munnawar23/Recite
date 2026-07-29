import { quranApiClient } from "./client";
import { Chapter } from "@/types/quran";

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
