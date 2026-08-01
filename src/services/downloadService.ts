import { getChapterAudio, getVersesByChapter } from "@/lib/api/quran-data";
import type { SurahVerse } from "@/types/quran";
import {
  createDownloadResumable,
  documentDirectory,
  DownloadProgressData,
  DownloadResumable,
} from "expo-file-system/legacy";

export const SUPPORTED_TRANSLATION_IDS = [20, 97, 122, 33, 161] as const;

export interface AudioTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number;
  duration: number;
  segments?: number[][];
}

export interface ChapterAudioData {
  audio_url?: string;
  file_size?: number;
  timestamps?: AudioTimestamp[];
}

export interface DownloadChapterResult {
  verses: SurahVerse[];
  versesByTranslation: Record<number, SurahVerse[]>;
  localAudioUri?: string;
  fileName?: string;
  timestamps: AudioTimestamp[];
  fileSize?: string;
  fileSizeBytes?: number;
}

export interface CreateAudioDownloadParams {
  chapterId: number;
  reciterId: number;
  fileSizeBytes?: number;
  onProgress: (fraction: number, writtenBytes: number, totalBytes: number) => void;
}

/**
 * Downloads translation verses for all supported translation IDs.
 */
export async function downloadTranslations(
  chapterId: number,
  preferredTranslationId: number,
): Promise<{
  defaultVerses: SurahVerse[];
  versesByTranslation: Record<number, SurahVerse[]>;
}> {
  const versesByTranslation: Record<number, SurahVerse[]> = {};

  await Promise.all(
    SUPPORTED_TRANSLATION_IDS.map(async (id) => {
      try {
        const res = await getVersesByChapter(chapterId, id);
        versesByTranslation[id] = res;
      } catch (err) {
        console.warn(`Failed to fetch translation ID ${id} for Surah ${chapterId}:`, err);
      }
    }),
  );

  const defaultVerses =
    versesByTranslation[preferredTranslationId] ||
    versesByTranslation[20] ||
    [];

  return { defaultVerses, versesByTranslation };
}

/**
 * Initiates audio file download via Expo FileSystem DownloadResumable.
 */
export async function createAudioDownload({
  chapterId,
  reciterId,
  fileSizeBytes,
  onProgress,
}: CreateAudioDownloadParams): Promise<{
  resumable: DownloadResumable | null;
  audioFileName?: string;
  timestamps: AudioTimestamp[];
  fileSize?: string;
  fileSizeBytes?: number;
  audioUrl?: string;
}> {
  const audioData: ChapterAudioData | undefined = await getChapterAudio(chapterId, reciterId);

  if (!audioData?.audio_url) {
    return { resumable: null, timestamps: [] };
  }

  let url = audioData.audio_url;
  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  const audioFileName = `surah_${chapterId}_reciter_${reciterId}.mp3`;
  const localPath = `${documentDirectory}${audioFileName}`;
  const sizeBytes = audioData.file_size || fileSizeBytes;
  const fileSizeStr = sizeBytes ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` : undefined;

  let lastUpdateTime = 0;
  const progressCallback = (dp: DownloadProgressData) => {
    const now = Date.now();
    const total =
      dp.totalBytesExpectedToWrite > 0
        ? dp.totalBytesExpectedToWrite
        : sizeBytes || 0;
    const written = dp.totalBytesWritten;
    const fraction = total > 0 ? written / total : 0;
    const isComplete = total > 0 && written >= total;

    if (now - lastUpdateTime > 300 || isComplete) {
      lastUpdateTime = now;
      onProgress(fraction, written, total);
    }
  };

  const resumable = createDownloadResumable(url, localPath, {}, progressCallback);

  return {
    resumable,
    audioFileName,
    timestamps: audioData.timestamps || [],
    fileSize: fileSizeStr,
    fileSizeBytes: sizeBytes,
    audioUrl: url,
  };
}
