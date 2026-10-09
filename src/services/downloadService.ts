import { ALL_TRANSLATION_IDS } from "@/constants";
import { getChapterAudio, getVersesByChapter } from "@/lib/api";
import * as FileSystem from "expo-file-system/legacy";
import { useDownloadsStore } from "@/store/downloadsStore";
import { Haptics } from "@/lib/haptics";

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

// ─── Active Background Task Manager ──────────────────────────────────────────

interface ActiveDownloadTask {
  resumable: FileSystem.DownloadResumable;
  isCancelled: boolean;
}

const activeTasks = new Map<number, ActiveDownloadTask>();

export function isChapterDownloading(chapterId: number): boolean {
  return activeTasks.has(chapterId);
}

export interface ChapterDownloadMetadata {
  name?: string;
  englishName?: string;
  englishTranslation?: string;
  versesCount?: string | number;
  chapterType?: string;
}

export interface StartChapterDownloadParams {
  chapterId: number;
  audioUrl: string;
  initialTotalBytes?: number | null;
  chapterInfo?: ChapterDownloadMetadata;
}

/**
 * Starts downloading audio and text for a chapter in the background.
 * Survives screen unmounts and updates global Zustand store with progress.
 */
export async function startChapterDownload({
  chapterId,
  audioUrl,
  initialTotalBytes,
  chapterInfo,
}: StartChapterDownloadParams): Promise<void> {
  if (activeTasks.has(chapterId)) {
    return;
  }

  const { updateActiveProgress, removeActiveDownload, addDownload } =
    useDownloadsStore.getState();

  const totalBytesExpected = initialTotalBytes ?? 0;

  updateActiveProgress(chapterId, {
    chapterId,
    progress: 0,
    bytesWritten: 0,
    totalBytes: totalBytesExpected,
    status: "downloading",
  });

  const taskEntry: ActiveDownloadTask = {
    resumable: null as any,
    isCancelled: false,
  };

  try {
    await prepareAudioDir();

    const resumable = createAudioDownload(
      chapterId,
      audioUrl,
      (written, total) => {
        if (taskEntry.isCancelled) return;
        const totalToUse = total > 0 ? total : totalBytesExpected;
        const progress = totalToUse > 0 ? Math.min(written / totalToUse, 1) : 0;
        updateActiveProgress(chapterId, {
          chapterId,
          bytesWritten: written,
          totalBytes: totalToUse,
          progress,
          status: "downloading",
        });
      },
    );

    taskEntry.resumable = resumable;
    activeTasks.set(chapterId, taskEntry);

    const result = await resumable.downloadAsync();

    // If cancelled during audio download, delete partial file to free user storage
    if (taskEntry.isCancelled || !result?.uri) {
      await deleteChapterDownload(chapterId);
      removeActiveDownload(chapterId);
      activeTasks.delete(chapterId);
      return;
    }

    const audioLocalPath = getLocalAudioPath(chapterId);

    // ── Text download (all translations) ─────────────────────
    const textBytes = await downloadChapterText(chapterId);

    // If cancelled during text download, delete partial files
    if (taskEntry.isCancelled) {
      await deleteChapterDownload(chapterId);
      removeActiveDownload(chapterId);
      activeTasks.delete(chapterId);
      return;
    }

    const audioInfo = await FileSystem.getInfoAsync(audioLocalPath);
    const audioBytes =
      audioInfo.exists && "size" in audioInfo
        ? audioInfo.size
        : totalBytesExpected;

    const versesCountNum = chapterInfo?.versesCount
      ? typeof chapterInfo.versesCount === "string"
        ? parseInt(chapterInfo.versesCount, 10)
        : chapterInfo.versesCount
      : 0;

    addDownload({
      chapterId,
      downloadedAt: Date.now(),
      audioLocalFile: getAudioFilename(chapterId),
      textLocalFile: getTextFilename(chapterId),
      totalBytes: audioBytes + textBytes,
      chapterInfo:
        chapterInfo?.name || chapterInfo?.englishName
          ? {
              name: chapterInfo.name ?? "",
              englishName: chapterInfo.englishName ?? "",
              englishTranslation: chapterInfo.englishTranslation ?? "",
              versesCount: versesCountNum,
              type: chapterInfo.chapterType ?? "",
            }
          : undefined,
    });

    removeActiveDownload(chapterId);
    activeTasks.delete(chapterId);
    Haptics.success();
  } catch (err: any) {
    if (taskEntry.isCancelled) {
      // User cancelled: purge partial files so user memory/storage is free
      await deleteChapterDownload(chapterId);
      removeActiveDownload(chapterId);
      activeTasks.delete(chapterId);
      return;
    }

    console.error(`[downloadService] Download failed for chapter ${chapterId}:`, err);
    // On unexpected error, clean up partial files and inform store
    await deleteChapterDownload(chapterId);
    activeTasks.delete(chapterId);
    updateActiveProgress(chapterId, {
      chapterId,
      status: "error",
      errorMessage: err?.message || "Download failed",
    });
    throw err;
  }
}

/**
 * Cancels download and purges any partially downloaded files from disk
 * to prevent wasting user device memory. Resets progress in the store to 0.
 */
export async function cancelChapterDownload(chapterId: number): Promise<void> {
  const taskEntry = activeTasks.get(chapterId);
  if (taskEntry) {
    taskEntry.isCancelled = true;
    try {
      await taskEntry.resumable?.cancelAsync();
    } catch {
      // ignore
    }
    activeTasks.delete(chapterId);
  }

  // Delete partial files from disk so user memory is never wasted
  await deleteChapterDownload(chapterId);

  // Remove from store so state and progress reset back to 0
  const { removeActiveDownload } = useDownloadsStore.getState();
  removeActiveDownload(chapterId);
}

