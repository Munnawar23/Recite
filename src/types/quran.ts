export interface Chapter {
  id: number;
  name: string;
  transliteration?: string;
  englishName: string;
  englishTranslation: string;
  versesCount: number;
  type: string;
}

export interface SurahVerse {
  id: number;
  verseKey: string;
  verseNumber: number;
  arabic: string;
  translation: string;
}
