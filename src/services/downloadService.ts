import { ALL_TRANSLATION_IDS } from "@/constants";
import { getChapterAudio, getVersesByChapter } from "@/lib/api";
import * as FileSystem from "expo-file-system/legacy";

// ─── Directory Paths ────────────────────────────────────────────────────────

const AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;
const TEXT_DIR = `${FileSystem.documentDirectory}text/`;

// ─── Helpers ────────────────────────────────────────────────────────────────

async function ensureDir(dir: string) {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export function getAudioFilename(chapterId: number): string {
  return `chapter_${chapterId}.mp3`;
}

export function getTextFilename(chapterId: number): string {
  return `chapter_${chapterId}_text.json`;
}

export function getLocalAudioPath(chapterId: number): string {
  return `${AUDIO_DIR}${getAudioFilename(chapterId)}`;
}

export function getLocalTextPath(chapterId: number): string {
  return `${TEXT_DIR}${getTextFilename(chapterId)}`;
}

// ─── Existence Checks ───────────────────────────────────────────────────────

export async function localAudioExists(chapterId: number): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(getLocalAudioPath(chapterId));
  return info.exists;
}

export async function localTextExists(chapterId: number): Promise<boolean> {
  const info = await FileSystem.getInfoAsync(getLocalTextPath(chapterId));
  return info.exists;
}

// ─── Audio Download ──────────────────────────────────────────────────────────

export interface AudioDownloadResult {
  localPath: string;
  totalBytes: number;
}

/**
 * Downloads audio MP3 to persistent documentDirectory.
 * Calls onProgress(bytesWritten, totalBytes) during download.
 * Returns a { downloadResumable } so caller can cancel if needed.
 */
export function createAudioDownload(
  chapterId: number,
  remoteUrl: string,
  onProgress: (bytesWritten: number, totalBytes: number) => void,
): FileSystem.DownloadResumable {
  const localUri = getLocalAudioPath(chapterId);

  return FileSystem.createDownloadResumable(
    remoteUrl,
    localUri,
    {},
    (downloadProgress) => {
      const { totalBytesWritten, totalBytesExpectedToWrite } = downloadProgress;
      onProgress(totalBytesWritten, totalBytesExpectedToWrite);
    },
  );
}

export async function prepareAudioDir() {
  await ensureDir(AUDIO_DIR);
}

// ─── Text Download ───────────────────────────────────────────────────────────

/**
 * Fetches all 6 translations for a chapter in parallel,
 * merges them, and saves to documentDirectory as JSON.
 * Returns total bytes written.
 */
export async function downloadChapterText(
  chapterId: number,
  reciterId: number = 7,
): Promise<number> {
  await ensureDir(TEXT_DIR);

  // Fetch all translations and audio timestamps in parallel
  const [results, audioRes] = await Promise.all([
    Promise.allSettled(
      ALL_TRANSLATION_IDS.map((tid) => getVersesByChapter(chapterId, tid)),
    ),
    getChapterAudio(chapterId, reciterId).catch(() => null),
  ]);

  // Build map: translationId → verses[]
  const translationsMap: Record<number, any[]> = {};
  results.forEach((result, idx) => {
    if (result.status === "fulfilled") {
      translationsMap[ALL_TRANSLATION_IDS[idx]] = result.value;
    }
  });

  const payload = {
    chapterId,
    downloadedAt: Date.now(),
    translationIds: ALL_TRANSLATION_IDS,
    translations: translationsMap,
    timestamps: audioRes?.timestamps || [],
  };

  const json = JSON.stringify(payload);
  const localPath = getLocalTextPath(chapterId);
  await FileSystem.writeAsStringAsync(localPath, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Return approximate byte size
  return new TextEncoder().encode(json).length;
}

// ─── Read Local Text ─────────────────────────────────────────────────────────

export interface LocalTextData {
  chapterId: number;
  translations: Record<number, any[]>;
  timestamps?: Array<{
    verse_key: string;
    timestamp_from: number;
    timestamp_to: number;
  }>;
}

/**
 * Reads locally saved verse text. Returns null if not downloaded.
 */
export async function getLocalTextData(
  chapterId: number,
): Promise<LocalTextData | null> {
  try {
    const path = getLocalTextPath(chapterId);
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return null;

    const raw = await FileSystem.readAsStringAsync(path, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return JSON.parse(raw) as LocalTextData;
  } catch {
    return null;
  }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/**
 * Deletes both audio and text files for a chapter.
 */
export async function deleteChapterDownload(chapterId: number): Promise<void> {
  const audioPath = getLocalAudioPath(chapterId);
  const textPath = getLocalTextPath(chapterId);

  const [audioInfo, textInfo] = await Promise.all([
    FileSystem.getInfoAsync(audioPath),
    FileSystem.getInfoAsync(textPath),
  ]);

  await Promise.all([
    audioInfo.exists
      ? FileSystem.deleteAsync(audioPath, { idempotent: true })
      : Promise.resolve(),
    textInfo.exists
      ? FileSystem.deleteAsync(textPath, { idempotent: true })
      : Promise.resolve(),
  ]);
}
