import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import type { SurahVerse } from "@/types/quran";
import {
  deleteAsync,
  documentDirectory,
  DownloadResumable,
} from "expo-file-system/legacy";
import {
  AudioTimestamp,
  createAudioDownload,
  downloadTranslations,
  SUPPORTED_TRANSLATION_IDS,
} from "@/services/downloadService";

export { SUPPORTED_TRANSLATION_IDS };

export interface DownloadedChapter {
  chapterId: number;
  verses: SurahVerse[];
  versesByTranslation?: Record<number, SurahVerse[]>;
  localAudioUri?: string;
  fileName?: string;
  reciterId?: number;
  reciterName?: string;
  timestamps?: AudioTimestamp[];
  fileSize?: string;
  fileSizeBytes?: number;
  downloadedAt: string;
}

interface ProgressData {
  fraction: number;
  writtenBytes: number;
  totalBytes: number;
}

/** Utility key helper for downloaded chapters per reciter */
export function getDownloadKey(chapterId: number, reciterId: number = 7): string {
  return `${chapterId}_${reciterId}`;
}

interface DownloadsState {
  downloadedChapters: Record<string | number, DownloadedChapter>;
  downloadingIds: Set<string>;
  downloadProgress: Record<string, ProgressData>;
  downloadError: Record<string, string | null>;
  activeResumables: Record<string, DownloadResumable>;

  downloadChapter: (
    chapterId: number,
    translationId: number,
    reciterId?: number,
    reciterName?: string,
  ) => Promise<void>;
  cancelDownload: (chapterId: number, reciterId?: number) => Promise<void>;
  deleteChapter: (chapterId: number, reciterId?: number) => Promise<void>;
  getDownloadedChapter: (
    chapterId: number,
    activeReciterId?: number,
  ) => DownloadedChapter | undefined;
}

/** Helper to clean up active download and progress tracking for a key */
function cleanupDownload(
  state: DownloadsState,
  downloadKey: string,
): Partial<DownloadsState> {
  const activeResumables = { ...state.activeResumables };
  delete activeResumables[downloadKey];

  const downloadProgress = { ...state.downloadProgress };
  delete downloadProgress[downloadKey];

  const downloadingIds = new Set(state.downloadingIds);
  downloadingIds.delete(downloadKey);

  return {
    downloadingIds,
    activeResumables,
    downloadProgress,
  };
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloadedChapters: {},
      downloadingIds: new Set<string>(),
      downloadProgress: {},
      downloadError: {},
      activeResumables: {},

      getDownloadedChapter: (chapterId: number, activeReciterId?: number) => {
        const { downloadedChapters } = get();
        let record: DownloadedChapter | undefined;

        if (activeReciterId) {
          const specificKey = getDownloadKey(chapterId, activeReciterId);
          if (downloadedChapters[specificKey]) {
            record = downloadedChapters[specificKey];
          }
        }

        // Fallback: check if legacy chapterId key exists
        if (!record && downloadedChapters[chapterId]) {
          record = downloadedChapters[chapterId];
        }

        // Fallback: return first available downloaded reciter for this chapterId
        if (!record) {
          const keys = Object.keys(downloadedChapters);
          const matchKey = keys.find(
            (k) => k === String(chapterId) || k.startsWith(`${chapterId}_`),
          );
          if (matchKey) {
            record = downloadedChapters[matchKey];
          }
        }

        if (!record) return undefined;

        // Dynamically resolve localAudioUri using documentDirectory to handle iOS container path changes
        const resolvedFileName =
          record.fileName ||
          (record.reciterId
            ? `surah_${record.chapterId}_reciter_${record.reciterId}.mp3`
            : undefined);
        const resolvedUri = resolvedFileName
          ? `${documentDirectory}${resolvedFileName}`
          : record.localAudioUri;

        return {
          ...record,
          localAudioUri: resolvedUri,
        };
      },

      downloadChapter: async (
        chapterId,
        translationId,
        reciterId = 7,
        reciterName,
      ) => {
        const downloadKey = getDownloadKey(chapterId, reciterId);
        const state = get();

        if (state.downloadingIds.has(downloadKey)) return;

        const nextDownloadingIds = new Set(state.downloadingIds);
        nextDownloadingIds.add(downloadKey);

        set({
          downloadingIds: nextDownloadingIds,
          downloadProgress: {
            ...state.downloadProgress,
            [downloadKey]: { fraction: 0, writtenBytes: 0, totalBytes: 0 },
          },
          downloadError: {
            ...state.downloadError,
            [downloadKey]: null,
          },
        });

        try {
          // 1. Download supported translations
          const { defaultVerses, versesByTranslation } =
            await downloadTranslations(chapterId, translationId);

          let localAudioUri: string | undefined;
          let fileName: string | undefined;
          let timestamps: AudioTimestamp[] = [];
          let fileSize: string | undefined;
          let fileSizeBytes: number | undefined;

          try {
            const {
              resumable,
              audioFileName,
              timestamps: audioTimestamps,
              fileSize: audioFileSize,
              fileSizeBytes: audioSizeBytes,
            } = await createAudioDownload({
              chapterId,
              reciterId,
              onProgress: (fraction, writtenBytes, totalBytes) => {
                set((s) => ({
                  downloadProgress: {
                    ...s.downloadProgress,
                    [downloadKey]: { fraction, writtenBytes, totalBytes },
                  },
                }));
              },
            });

            if (resumable) {
              set((s) => ({
                activeResumables: {
                  ...s.activeResumables,
                  [downloadKey]: resumable,
                },
              }));

              const downloadResult = await resumable.downloadAsync();

              if (downloadResult) {
                localAudioUri = downloadResult.uri;
                fileName = audioFileName;
              }
              timestamps = audioTimestamps;
              fileSize = audioFileSize;
              fileSizeBytes = audioSizeBytes;
            }
          } catch (audioErr: unknown) {
            if (!get().downloadingIds.has(downloadKey)) {
              return; // Gracefully cancelled
            }
            console.warn("Audio download error:", audioErr);
          }

          if (!get().downloadingIds.has(downloadKey)) {
            return; // Gracefully cancelled
          }

          const record: DownloadedChapter = {
            chapterId,
            verses: defaultVerses,
            versesByTranslation,
            localAudioUri,
            fileName,
            reciterId,
            reciterName,
            timestamps,
            fileSize,
            fileSizeBytes,
            downloadedAt: new Date().toISOString(),
          };

          set((s) => ({
            downloadedChapters: {
              ...s.downloadedChapters,
              [downloadKey]: record,
              [chapterId]: record, // Keep legacy key populated for backward compatibility
            },
          }));
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to download Surah";
          console.error("Failed to download Surah:", error);

          set((s) => ({
            downloadError: {
              ...s.downloadError,
              [downloadKey]: errorMessage,
            },
          }));
        } finally {
          set((s) => cleanupDownload(s, downloadKey));
        }
      },

      cancelDownload: async (chapterId, reciterId = 7) => {
        const downloadKey = getDownloadKey(chapterId, reciterId);
        const resumable = get().activeResumables[downloadKey];

        set((s) => cleanupDownload(s, downloadKey));

        if (resumable) {
          try {
            await resumable.pauseAsync();
          } catch (e) {
            console.warn("Cancel error:", e);
          }
        }
      },

      deleteChapter: async (chapterId, reciterId = 7) => {
        const { downloadedChapters } = get();
        const downloadKey = getDownloadKey(chapterId, reciterId);
        const record =
          downloadedChapters[downloadKey] || downloadedChapters[chapterId];

        if (record) {
          const resolvedFileName =
            record.fileName ||
            (record.reciterId
              ? `surah_${record.chapterId}_reciter_${record.reciterId}.mp3`
              : undefined);
          const targetUri = resolvedFileName
            ? `${documentDirectory}${resolvedFileName}`
            : record.localAudioUri;

          if (targetUri) {
            try {
              await deleteAsync(targetUri, { idempotent: true });
            } catch (err) {
              console.warn("Failed to delete local audio file:", err);
            }
          }
        }

        set((s) => {
          const updated = { ...s.downloadedChapters };
          delete updated[downloadKey];

          // Check if any other reciter downloads remain for this chapterId
          const remainingReciterKey = Object.keys(updated).find(
            (k) => k.startsWith(`${chapterId}_`) && updated[k],
          );

          if (remainingReciterKey) {
            // Update legacy fallback key to point to remaining reciter download
            updated[chapterId] = updated[remainingReciterKey];
          } else {
            delete updated[chapterId];
          }

          return { downloadedChapters: updated };
        });
      },
    }),
    {
      name: STORAGE_KEYS.DOWNLOADS,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        downloadedChapters: state.downloadedChapters,
      }),
    },
  ),
);
