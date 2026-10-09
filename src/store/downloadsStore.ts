import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { DownloadedChapter } from "@/types";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";

export type { DownloadedChapter };

export interface ActiveDownloadProgress {
  chapterId: number;
  progress: number;
  bytesWritten: number;
  totalBytes: number;
  status: "downloading" | "error";
  errorMessage?: string;
}

interface DownloadsState {
  downloads: Record<number, DownloadedChapter>;
  activeDownloads: Record<number, ActiveDownloadProgress>;
  addDownload: (chapter: DownloadedChapter) => void;
  removeDownload: (chapterId: number) => void;
  isDownloaded: (chapterId: number) => boolean;
  getDownload: (chapterId: number) => DownloadedChapter | undefined;
  updateActiveProgress: (
    chapterId: number,
    progress: Partial<ActiveDownloadProgress>,
  ) => void;
  removeActiveDownload: (chapterId: number) => void;
  getActiveDownload: (chapterId: number) => ActiveDownloadProgress | undefined;
}

export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      downloads: {},
      activeDownloads: {},

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

      updateActiveProgress: (chapterId, update) =>
        set((state) => {
          const current = state.activeDownloads[chapterId] || {
            chapterId,
            progress: 0,
            bytesWritten: 0,
            totalBytes: 0,
            status: "downloading",
          };
          return {
            activeDownloads: {
              ...state.activeDownloads,
              [chapterId]: { ...current, ...update },
            },
          };
        }),

      removeActiveDownload: (chapterId) =>
        set((state) => {
          if (!state.activeDownloads[chapterId]) return state;
          const next = { ...state.activeDownloads };
          delete next[chapterId];
          return { activeDownloads: next };
        }),

      getActiveDownload: (chapterId) => get().activeDownloads[chapterId],
    }),
    {
      name: STORAGE_KEYS.DOWNLOADS,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ downloads: state.downloads }),
    },
  ),
);
