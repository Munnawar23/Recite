import AsyncStorage from "@react-native-async-storage/async-storage";
import { StateStorage } from "zustand/middleware";

export const STORAGE_KEYS = {
  THEME: "theme-storage",
  FONT_SCALE: "font-scale-storage",
  LANGUAGE: "user-language",
  NOTIFICATION: "notification-storage",
  DOWNLOADS: "downloads-storage",
  FAVORITES: "favorites-storage",
  ONBOARDING: "onboarding-storage",
  READING_PROGRESS: "reading-progress-storage",
  LOCATION: "user-location-storage",
  QUERY_CACHE: "RECITE_QUERY_CACHE_V2",
} as const;

export const appStorage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue == null) return null;
      try {
        return JSON.parse(jsonValue) as T;
      } catch {
        // Fallback for unquoted/raw string values previously stored in AsyncStorage
        return jsonValue as unknown as T;
      }
    } catch (e) {
      console.error(`[appStorage] Error reading key "${key}":`, e);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error(`[appStorage] Error setting key "${key}":`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`[appStorage] Error removing key "${key}":`, e);
    }
  },
};

/**
 * Custom StateStorage adapter for Zustand persist middleware
 */
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await AsyncStorage.getItem(name)) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

// ─── Download Storage ─────────────────────────────────────────────────────────

/**
 * Shape of a single downloaded chapter record.
 * Stored as a value inside the downloads map keyed by chapterId.
 */
import { DownloadedChapter } from "@/types/quran";
export type { DownloadedChapter };

/** Internal shape persisted under STORAGE_KEYS.DOWNLOADS */
type DownloadsRecord = Record<number, DownloadedChapter>;

/**
 * Read the full downloads map from AsyncStorage.
 * Returns empty object if nothing saved yet.
 */
export async function getDownloadsRecord(): Promise<DownloadsRecord> {
  const data = await appStorage.getItem<DownloadsRecord>(STORAGE_KEYS.DOWNLOADS);
  return data ?? {};
}

/**
 * Save (upsert) a single chapter download entry.
 * Merges with existing records — does NOT wipe others.
 */
export async function saveDownloadEntry(chapter: DownloadedChapter): Promise<void> {
  const existing = await getDownloadsRecord();
  const updated: DownloadsRecord = { ...existing, [chapter.chapterId]: chapter };
  await appStorage.setItem(STORAGE_KEYS.DOWNLOADS, updated);
}

/**
 * Remove a single chapter download entry by chapterId.
 */
export async function removeDownloadEntry(chapterId: number): Promise<void> {
  const existing = await getDownloadsRecord();
  const updated = { ...existing };
  delete updated[chapterId];
  await appStorage.setItem(STORAGE_KEYS.DOWNLOADS, updated);
}

/**
 * Check if a chapter is downloaded without loading the full map.
 * Useful for one-off checks outside of Zustand.
 */
export async function isChapterDownloaded(chapterId: number): Promise<boolean> {
  const record = await getDownloadsRecord();
  return !!record[chapterId];
}

/**
 * Clear all download records from storage entirely.
 * Use with caution — does not delete the actual files.
 */
export async function clearAllDownloads(): Promise<void> {
  await appStorage.removeItem(STORAGE_KEYS.DOWNLOADS);
}
