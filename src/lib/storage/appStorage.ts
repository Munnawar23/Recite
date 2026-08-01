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
