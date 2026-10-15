import { useQuery } from "@tanstack/react-query";

import {
  getRandomVerseWithAllTranslations,
  type DailyVerseMultiLang,
} from "@/lib/api";
import { appStorage } from "@/lib/storage/appStorage";
import { useLanguageStore } from "@/store/languageStore";

const STORAGE_KEY = "daily_verse_today";

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

interface StoredDailyVerseData extends DailyVerseMultiLang {
  date: string; // YYYY-MM-DD
}

const ONE_DAY = 24 * 60 * 60 * 1000;

function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useDailyVerse() {
  const language = useLanguageStore((state) => state.language);
  const today = getLocalDateString();

  return useQuery({
    queryKey: ["dailyVerse", language, today],

    queryFn: async (): Promise<DailyVerse> => {
      try {
        const cached = await appStorage.getItem<StoredDailyVerseData>(STORAGE_KEY);

        if (cached?.date === today && cached.translations) {
          const translation =
            cached.translations[language] ||
            cached.translations.en ||
            STATIC_VERSE.translation;

          return {
            arabic: cached.arabic,
            translation,
            source: cached.source,
          };
        }
      } catch (error) {
        console.error("Failed to read daily verse from storage:", error);
      }

      try {
        const multiLangVerse = await getRandomVerseWithAllTranslations();

        await appStorage.setItem(STORAGE_KEY, {
          ...multiLangVerse,
          date: today,
        });

        const translation =
          multiLangVerse.translations[language] ||
          multiLangVerse.translations.en ||
          STATIC_VERSE.translation;

        return {
          arabic: multiLangVerse.arabic,
          translation,
          source: multiLangVerse.source,
        };
      } catch (error) {
        console.error(
          "Failed to fetch daily verse, falling back to cached or static verse:",
          error,
        );

        // Fallback to last cached verse if offline on a new day
        try {
          const lastCached =
            await appStorage.getItem<StoredDailyVerseData>(STORAGE_KEY);
          if (lastCached?.arabic) {
            const translation =
              lastCached.translations?.[language] ||
              lastCached.translations?.en ||
              STATIC_VERSE.translation;

            return {
              arabic: lastCached.arabic,
              translation,
              source: lastCached.source,
            };
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
