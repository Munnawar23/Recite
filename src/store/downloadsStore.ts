import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { getChapterAudio, getVersesByChapter } from "@/lib/api/quran-data";
import type { SurahVerse } from "@/types/quran";
import { createDownloadResumable, deleteAsync, documentDirectory } from "expo-file-system/legacy";

export interface DownloadedChapter {
  chapterId: number;
  verses: SurahVerse[];
  versesByTranslation?: Record<number, SurahVerse[]>;
  localAudioUri?: string;
  timestamps?: any[];
  fileSize?: string;
  downloadedAt: string;
}

interface DownloadsState {
  downloadedChapters: Record<number, DownloadedChapter>;
  downloadingIds: number[];
  downloadProgress: Record<number, number>;
  downloadChapter: (chapterId: number, translationId: number) => Promise<void>;
  deleteChapter: (chapterId: number) => Promise<void>;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloadedChapters: {},
      downloadingIds: [],
      downloadProgress: {},
      downloadChapter: async (chapterId, translationId) => {
        const { downloadingIds } = get();
        if (downloadingIds.includes(chapterId)) return;

        set({
          downloadingIds: [...downloadingIds, chapterId],
          downloadProgress: { ...get().downloadProgress, [chapterId]: 0 },
        });

        try {
          // 1. Download supported translations in parallel (English, Urdu, Hindi, Indonesian, Bengali)
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

          // 2. Download audio file
          let localAudioUri: string | undefined;
          let timestamps: any[] = [];
          let fileSize: string | undefined;
          try {
            const audioData = await getChapterAudio(chapterId);
            if (audioData?.audio_url) {
              let url = audioData.audio_url;
              if (url.startsWith("//")) {
                url = `https:${url}`;
              }
              const localPath = `${documentDirectory}surah_${chapterId}.mp3`;

              if (audioData.file_size) {
                fileSize = `${(audioData.file_size / (1024 * 1024)).toFixed(1)} MB`;
              }

              const progressCallback = (downloadProgress: any) => {
                if (downloadProgress.totalBytesExpectedToWrite > 0) {
                  const fraction = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                  set((state) => ({
                    downloadProgress: {
                      ...state.downloadProgress,
                      [chapterId]: fraction,
                    },
                  }));
                }
              };

              const downloadResumable = createDownloadResumable(url, localPath, {}, progressCallback);
              const downloadResult = await downloadResumable.downloadAsync();

              if (downloadResult) {
                localAudioUri = downloadResult.uri;
              }
              timestamps = audioData.timestamps || [];
            }
          } catch (audioErr) {
            console.warn("Failed to download audio for Surah:", audioErr);
          }

          set((state) => ({
            downloadedChapters: {
              ...state.downloadedChapters,
              [chapterId]: {
                chapterId,
                verses: defaultVerses,
                versesByTranslation,
                localAudioUri,
                timestamps,
                fileSize,
                downloadedAt: new Date().toISOString(),
              },
            },
          }));
        } catch (error) {
          console.error("Failed to download Surah:", error);
          throw error;
        } finally {
          set((state) => {
            const progressCopy = { ...state.downloadProgress };
            delete progressCopy[chapterId];
            return {
              downloadingIds: state.downloadingIds.filter((id) => id !== chapterId),
              downloadProgress: progressCopy,
            };
          });
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
