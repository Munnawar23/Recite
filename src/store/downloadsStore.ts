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

interface DownloadsState {
  downloadedChapters: Record<number, DownloadedChapter>;
  downloadingIds: number[];
  downloadProgress: Record<number, ProgressData>;
  activeResumables: Record<number, DownloadResumable>;
  downloadChapter: (chapterId: number, translationId: number, reciterId?: number, reciterName?: string) => Promise<void>;
  cancelDownload: (chapterId: number) => Promise<void>;
  deleteChapter: (chapterId: number) => Promise<void>;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloadedChapters: {},
      downloadingIds: [],
      downloadProgress: {},
      activeResumables: {},
      downloadChapter: async (chapterId, translationId, reciterId = 7, reciterName) => {
        const { downloadingIds } = get();
        if (downloadingIds.includes(chapterId)) return;

        set({
          downloadingIds: [...downloadingIds, chapterId],
          downloadProgress: {
            ...get().downloadProgress,
            [chapterId]: { fraction: 0, writtenBytes: 0, totalBytes: 0 },
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
              const localPath = `${documentDirectory}surah_${chapterId}_reciter_${reciterId}.mp3`;

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
                      [chapterId]: { fraction, writtenBytes: written, totalBytes: total },
                    },
                  }));
                }
              };

              const downloadResumable = createDownloadResumable(url, localPath, {}, progressCallback);
              set((state) => ({
                activeResumables: { ...state.activeResumables, [chapterId]: downloadResumable },
              }));

              const downloadResult = await downloadResumable.downloadAsync();

              if (downloadResult) {
                localAudioUri = downloadResult.uri;
              }
              timestamps = audioData.timestamps || [];
            }
          } catch (audioErr: any) {
            if (!get().downloadingIds.includes(chapterId)) {
              return; // Gracefully cancelled
            }
            console.warn("Audio download error:", audioErr);
          }

          if (!get().downloadingIds.includes(chapterId)) {
            return;
          }

          set((state) => ({
            downloadedChapters: {
              ...state.downloadedChapters,
              [chapterId]: {
                chapterId,
                verses: defaultVerses,
                versesByTranslation,
                localAudioUri,
                reciterId,
                reciterName,
                timestamps,
                fileSize,
                fileSizeBytes,
                downloadedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to download Surah:", error);
        } finally {
          set((state) => {
            const activeCopy = { ...state.activeResumables };
            delete activeCopy[chapterId];
            const progressCopy = { ...state.downloadProgress };
            delete progressCopy[chapterId];

            return {
              downloadingIds: state.downloadingIds.filter((id) => id !== chapterId),
              activeResumables: activeCopy,
              downloadProgress: progressCopy,
            };
          });
        }
      },

      cancelDownload: async (chapterId) => {
        const resumable = get().activeResumables[chapterId];
        set((state) => {
          const activeCopy = { ...state.activeResumables };
          delete activeCopy[chapterId];
          const progressCopy = { ...state.downloadProgress };
          delete progressCopy[chapterId];

          return {
            downloadingIds: state.downloadingIds.filter((id) => id !== chapterId),
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

      deleteChapter: async (chapterId) => {
        const { downloadedChapters } = get();
        const record = downloadedChapters[chapterId];

        if (record?.localAudioUri) {
          try {
            await deleteAsync(record.localAudioUri, { idempotent: true });
          } catch (err) {
            console.warn("Failed to delete local audio file:", err);
          }
        }

        set((state) => {
          const updated = { ...state.downloadedChapters };
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
