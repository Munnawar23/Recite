import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { getChapterAudio, getVersesByChapter } from "@/lib/api/quran-data";
import type { SurahVerse } from "@/types/quran";
import { createDownloadResumable, deleteAsync, documentDirectory, DownloadResumable } from "expo-file-system/legacy";

export interface DownloadedChapter {
  chapterId: number;
  verses: SurahVerse[];
  versesByTranslation?: Record<number, SurahVerse[]>;
  localAudioUri?: string;
  fileName?: string;
  reciterId?: number;
  reciterName?: string;
  timestamps?: any[];
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
  /** Keyed by getDownloadKey(chapterId, reciterId) AND fallback legacy chapterId key */
  downloadedChapters: Record<string | number, DownloadedChapter>;
  downloadingIds: string[]; // key formatted as `${chapterId}_${reciterId}`
  downloadProgress: Record<string, ProgressData>;
  activeResumables: Record<string, DownloadResumable>;
  downloadChapter: (chapterId: number, translationId: number, reciterId?: number, reciterName?: string) => Promise<void>;
  cancelDownload: (chapterId: number, reciterId?: number) => Promise<void>;
  deleteChapter: (chapterId: number, reciterId?: number) => Promise<void>;
  /** Find downloaded record for a chapter (preferring active reciterId, or returning first available if offline) */
  getDownloadedChapter: (chapterId: number, activeReciterId?: number) => DownloadedChapter | undefined;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloadedChapters: {},
      downloadingIds: [],
      downloadProgress: {},
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
            (k) => k === String(chapterId) || k.startsWith(`${chapterId}_`)
          );
          if (matchKey) {
            record = downloadedChapters[matchKey];
          }
        }

        if (!record) return undefined;

        // Dynamically resolve localAudioUri using documentDirectory to handle iOS container path changes
        const resolvedFileName = record.fileName || (record.reciterId ? `surah_${record.chapterId}_reciter_${record.reciterId}.mp3` : undefined);
        const resolvedUri = resolvedFileName ? `${documentDirectory}${resolvedFileName}` : record.localAudioUri;

        return {
          ...record,
          localAudioUri: resolvedUri,
        };
      },
      downloadChapter: async (chapterId, translationId, reciterId = 7, reciterName) => {
        const downloadKey = getDownloadKey(chapterId, reciterId);
        const { downloadingIds } = get();
        if (downloadingIds.includes(downloadKey)) return;

        set({
          downloadingIds: [...downloadingIds, downloadKey],
          downloadProgress: {
            ...get().downloadProgress,
            [downloadKey]: { fraction: 0, writtenBytes: 0, totalBytes: 0 },
          },
        });

        try {
          // 1. Download supported translations in parallel
          const transIds = [20, 97, 122, 33, 161];
          const versesByTranslation: Record<number, SurahVerse[]> = {};

          await Promise.all(
            transIds.map(async (id) => {
              try {
                const res = await getVersesByChapter(chapterId, id);
                versesByTranslation[id] = res;
              } catch (err) {
                console.warn(`Failed to fetch translation ID ${id} for Surah:`, err);
              }
            })
          );

          const defaultVerses = versesByTranslation[translationId] || versesByTranslation[20] || [];

          let localAudioUri: string | undefined;
          let fileName: string | undefined;
          let timestamps: any[] = [];
          let fileSize: string | undefined;
          let fileSizeBytes: number | undefined;

          try {
            const audioData = await getChapterAudio(chapterId, reciterId);
            if (audioData?.audio_url) {
              let url = audioData.audio_url;
              if (url.startsWith("//")) {
                url = `https:${url}`;
              }
              const audioFileName = `surah_${chapterId}_reciter_${reciterId}.mp3`;
              const localPath = `${documentDirectory}${audioFileName}`;

              if (audioData.file_size) {
                fileSizeBytes = audioData.file_size;
                fileSize = `${(audioData.file_size / (1024 * 1024)).toFixed(1)} MB`;
              }

              let lastUpdateTime = 0;
              const progressCallback = (dp: any) => {
                const now = Date.now();
                // Throttle progress updates to at most once every 300ms, or when completed
                const total = dp.totalBytesExpectedToWrite > 0 ? dp.totalBytesExpectedToWrite : (fileSizeBytes || 0);
                const written = dp.totalBytesWritten;
                const fraction = total > 0 ? written / total : 0;
                const isComplete = total > 0 && written >= total;

                if (now - lastUpdateTime > 300 || isComplete) {
                  lastUpdateTime = now;
                  set((state) => ({
                    downloadProgress: {
                      ...state.downloadProgress,
                      [downloadKey]: { fraction, writtenBytes: written, totalBytes: total },
                    },
                  }));
                }
              };

              const downloadResumable = createDownloadResumable(url, localPath, {}, progressCallback);
              set((state) => ({
                activeResumables: { ...state.activeResumables, [downloadKey]: downloadResumable },
              }));

              const downloadResult = await downloadResumable.downloadAsync();

              if (downloadResult) {
                localAudioUri = downloadResult.uri;
                fileName = audioFileName;
              }
              timestamps = audioData.timestamps || [];
            }
          } catch (audioErr: any) {
            if (!get().downloadingIds.includes(downloadKey)) {
              return; // Gracefully cancelled
            }
            console.warn("Audio download error:", audioErr);
          }

          if (!get().downloadingIds.includes(downloadKey)) {
            return;
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

          set((state) => ({
            downloadedChapters: {
              ...state.downloadedChapters,
              [downloadKey]: record,
              [chapterId]: record, // Keep legacy key populated for backward compatibility
            },
          }));
        } catch (error) {
          console.error("Failed to download Surah:", error);
        } finally {
          set((state) => {
            const activeCopy = { ...state.activeResumables };
            delete activeCopy[downloadKey];
            const progressCopy = { ...state.downloadProgress };
            delete progressCopy[downloadKey];

            return {
              downloadingIds: state.downloadingIds.filter((id) => id !== downloadKey),
              activeResumables: activeCopy,
              downloadProgress: progressCopy,
            };
          });
        }
      },

      cancelDownload: async (chapterId, reciterId = 7) => {
        const downloadKey = getDownloadKey(chapterId, reciterId);
        const resumable = get().activeResumables[downloadKey];
        set((state) => {
          const activeCopy = { ...state.activeResumables };
          delete activeCopy[downloadKey];
          const progressCopy = { ...state.downloadProgress };
          delete progressCopy[downloadKey];

          return {
            downloadingIds: state.downloadingIds.filter((id) => id !== downloadKey),
            activeResumables: activeCopy,
            downloadProgress: progressCopy,
          };
        });

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
        const record = downloadedChapters[downloadKey] || downloadedChapters[chapterId];

        if (record?.localAudioUri) {
          try {
            await deleteAsync(record.localAudioUri, { idempotent: true });
          } catch (err) {
            console.warn("Failed to delete local audio file:", err);
          }
        }

        set((state) => {
          const updated = { ...state.downloadedChapters };
          delete updated[downloadKey];
          delete updated[chapterId];
          return { downloadedChapters: updated };
        });
      },
    }),
    {
      name: STORAGE_KEYS.DOWNLOADS,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) =>
        ({
          downloadedChapters: state.downloadedChapters,
        }) as any,
    }
  )
);
