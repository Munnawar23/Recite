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

export interface DownloadedChapter {
  chapterId: number;
  downloadedAt: number;        // Unix timestamp (ms)
  audioLocalFile: string;      // filename only — e.g. "chapter_1.mp3"
  textLocalFile: string;       // filename only — e.g. "chapter_1_text.json"
  totalBytes: number;          // combined audio + text size in bytes
}

