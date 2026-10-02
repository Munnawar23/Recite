import { quranApiClient } from "./client";
import { Chapter } from "@/types";

const DEFAULT_LANGUAGE = "en";

interface ApiChapterDto {
  id: number;
  name_arabic: string;
  name_simple: string;
  translated_name?: {
    name?: string;
  };
  revelation_place: string;
  verses_count: number;
}

interface ChaptersResponse {
  chapters?: ApiChapterDto[];
}

function mapChapter(ch: ApiChapterDto): Chapter {
  return {
    id: ch.id,
    name: ch.name_arabic || "",
    englishName: ch.name_simple || "",
    englishTranslation: ch.translated_name?.name || "",
    type: ch.revelation_place === "makkah" ? "meccan" : "medinan",
    versesCount: ch.verses_count || 0,
  };
}

/** Fetches full list of 114 Quran chapters */
export const getChapters = async (): Promise<Chapter[]> => {
  const { data } = await quranApiClient.get<ChaptersResponse>("/chapters", {
    params: {
      language: DEFAULT_LANGUAGE,
    },
  });

  return (data?.chapters || []).map(mapChapter);
};
