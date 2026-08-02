import { useQuery } from "@tanstack/react-query";

import { getRandomVerse } from "@/lib/api/daily-verse";
import { appStorage } from "@/lib/storage/appStorage";
import { useLanguageStore } from "@/store/languageStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";

const STORAGE_KEY_PREFIX = "daily_verse_data_";

export const STATIC_VERSE = {
  arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
  translation: "For indeed, with hardship comes ease.",
  source: "Surah Ash-Sharh · 94:6",
};

interface DailyVerse {
  arabic: string;
  translation: string;
  source: string;
}

interface DailyVerseData {
  verse: DailyVerse;
  date: string; // YYYY-MM-DD
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export function useDailyVerse() {
  const language = useLanguageStore((state) => state.language);
  const translationId = useQuranSettingsStore((state) => state.translationId);
  const storageKey = `${STORAGE_KEY_PREFIX}${language}_${translationId}`;

  return useQuery({
    queryKey: ["dailyVerse", language, translationId],

    queryFn: async (): Promise<DailyVerse> => {
      const today = new Date().toISOString().split("T")[0];

      try {
        const cached = await appStorage.getItem<DailyVerseData>(storageKey);

        if (cached?.date === today) {
          return cached.verse;
        }
      } catch (error) {
        console.error("Failed to read daily verse from storage:", error);
      }

      try {
        const verse = await getRandomVerse(language, translationId);

        await appStorage.setItem(storageKey, {
          verse,
          date: today,
        });

        return verse;
      } catch (error) {
        console.error(
          "Failed to fetch daily verse, falling back to cached or static verse:",
          error,
        );

        // Fallback to last cached verse if offline on a new day
        try {
          const lastCached =
            await appStorage.getItem<DailyVerseData>(storageKey);
          if (lastCached?.verse) {
            return lastCached.verse;
          }
        } catch (e) {
          // Ignore cache read error
        }

        return STATIC_VERSE;
      }
    },

    staleTime: ONE_DAY,
    gcTime: 7 * ONE_DAY,
  });
}
