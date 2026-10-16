export const ENV = {
  QURAN_API_URL:
    process.env.EXPO_PUBLIC_QURAN_API_URL || "https://api.quran.com/api/v4",
  ISLAMIC_NETWORK_CDN_URL:
    process.env.EXPO_PUBLIC_ISLAMIC_NETWORK_CDN_URL ||
    "https://cdn.islamic.network/quran/audio-surah",
} as const;
