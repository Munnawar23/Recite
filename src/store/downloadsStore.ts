import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DownloadedChapter } from "@/types";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";

export type { DownloadedChapter };

interface DownloadsState {
  downloads: Record<number, DownloadedChapter>;
  addDownload: (chapter: DownloadedChapter) => void;
  removeDownload: (chapterId: number) => void;
  isDownloaded: (chapterId: number) => boolean;
  getDownload: (chapterId: number) => DownloadedChapter | undefined;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloads: {},

      addDownload: (chapter) =>
        set((state) => ({
          downloads: { ...state.downloads, [chapter.chapterId]: chapter },
        })),

      removeDownload: (chapterId) =>
        set((state) => {
          const next = { ...state.downloads };
          delete next[chapterId];
          return { downloads: next };
        }),

      isDownloaded: (chapterId) => !!get().downloads[chapterId],

      getDownload: (chapterId) => get().downloads[chapterId],
    }),
    {
      name: STORAGE_KEYS.DOWNLOADS,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
