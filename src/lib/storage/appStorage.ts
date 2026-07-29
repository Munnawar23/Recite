import AsyncStorage from "@react-native-async-storage/async-storage";
import { StateStorage } from "zustand/middleware";

export const STORAGE_KEYS = {
  THEME: "theme-storage",
  FONT_SCALE: "font-scale-storage",
  LANGUAGE: "user-language",
  NOTIFICATION: "notification-storage",
  DOWNLOADS: "downloads-storage",
  FAVORITES: "favorites-storage",
} as const;


export const appStorage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error(`[appStorage] Error reading key "${key}":`, e);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
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

  // Specialized helpers for language persistence
  async getLanguage(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    } catch (e) {
      console.error(`[appStorage] Error reading language key:`, e);
      return null;
    }
  },

  async setLanguage(languageCode: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, languageCode);
    } catch (e) {
      console.error(`[appStorage] Error setting language key:`, e);
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
