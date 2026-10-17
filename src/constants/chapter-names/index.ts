import { Chapter, ChapterNameEntry } from "@/types";
import { AR_CHAPTER_NAMES } from "./ar";
import { BN_CHAPTER_NAMES } from "./bn";
import { EN_CHAPTER_NAMES } from "./en";
import { FA_CHAPTER_NAMES } from "./fa";
import { FR_CHAPTER_NAMES } from "./fr";
import { HI_CHAPTER_NAMES } from "./hi";
import { ID_CHAPTER_NAMES } from "./id";
import { MS_CHAPTER_NAMES } from "./ms";
import { RU_CHAPTER_NAMES } from "./ru";
import { TR_CHAPTER_NAMES } from "./tr";
import { UR_CHAPTER_NAMES } from "./ur";
import { ChapterBaseMetadata, CHAPTERS_METADATA } from "./metadata";

export * from "./ar";
export * from "./bn";
export * from "./en";
export * from "./fa";
export * from "./fr";
export * from "./hi";
export * from "./id";
export * from "./ms";
export * from "./ru";
export * from "./tr";
export * from "./ur";
export * from "./metadata";


export const CHAPTER_NAMES_BY_LANG: Record<string, Record<number, ChapterNameEntry>> = {
  ar: AR_CHAPTER_NAMES,
  bn: BN_CHAPTER_NAMES,
  en: EN_CHAPTER_NAMES,
  fa: FA_CHAPTER_NAMES,
  fr: FR_CHAPTER_NAMES,
  hi: HI_CHAPTER_NAMES,
  id: ID_CHAPTER_NAMES,
  ms: MS_CHAPTER_NAMES,
  ru: RU_CHAPTER_NAMES,
  tr: TR_CHAPTER_NAMES,
  ur: UR_CHAPTER_NAMES,
};

// ─── Helper: resolve language map with English fallback ──────────────────────

function getLangMap(language: string): Record<number, ChapterNameEntry> {
  return CHAPTER_NAMES_BY_LANG[language] ?? CHAPTER_NAMES_BY_LANG.en;
}

// ─── Private: builds a single Chapter object ─────────────────────────────────

function buildChapter(meta: ChapterBaseMetadata, language: string): Chapter {
  const loc = getLangMap(language)[meta.id] ?? EN_CHAPTER_NAMES[meta.id];
  return {
    id: meta.id,
    name: AR_CHAPTER_NAMES[meta.id]?.name ?? "",
    localizedName: loc?.name ?? `Surah ${meta.id}`,
    localizedTranslation: loc?.meaning ?? "",
    versesCount: meta.versesCount,
    type: meta.type,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Returns all 114 chapters localized for the given language. */
export function getChapters(language: string = "en"): Chapter[] {
  return CHAPTERS_METADATA.map((meta) => buildChapter(meta, language));
}

/** Returns a single chapter localized for the given language. */
export function getChapter(id: number, language: string = "en"): Chapter {
  return buildChapter(CHAPTERS_METADATA[id - 1] ?? CHAPTERS_METADATA[0], language);
}

/** Returns the localized Surah name string for the given language. */
export function getSurahName(id: number, language: string = "en"): string {
  return getLangMap(language)[id]?.name ?? EN_CHAPTER_NAMES[id]?.name ?? `Surah ${id}`;
}


