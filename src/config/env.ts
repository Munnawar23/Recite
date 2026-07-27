export const ENV = {
  QURAN_API_URL:
    process.env.EXPO_PUBLIC_QURAN_API_URL || "https://api.quran.com/api/v4",
} as const;
