import { quranApiClient } from "./client";
import { Chapter } from "@/types/quran";

const DEFAULT_LANGUAGE = "en";
const SEARCH_SIZE = 20;

/** Utility helper to strip HTML tags from text safely */
export function stripHtmlTags(text?: string): string {
  if (!text) return "";
  return text.replace(/<[^>]+>/g, "");
}

// API Response DTO Interfaces
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

interface ApiSearchResultDto {
  verse_id: number;
  verse_key: string;
  text: string;
  translations?: Array<{
    text?: string;
  }>;
}

interface SearchResponse {
  search?: {
    results?: ApiSearchResultDto[];
  };
}

/** Mapper helper for Chapter API data */
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

/** Mapper helper for Search Result API data */
function mapSearchResult(v: ApiSearchResultDto): Chapter {
  return {
    id: v.verse_id,
    name: v.text || "",
    englishName: `Verse ${v.verse_key || ""}`,
    englishTranslation: stripHtmlTags(v.translations?.[0]?.text),
    type: "Search Result",
    versesCount: 0,
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

/** Searches Quran verses by query keyword */
export const searchQuran = async (query: string): Promise<Chapter[]> => {
  if (!query || query.trim() === "") return [];

  const { data } = await quranApiClient.get<SearchResponse>("/search", {
    params: {
      query: query.trim(),
      size: SEARCH_SIZE,
    },
  });

  return (data?.search?.results || []).map(mapSearchResult);
};
