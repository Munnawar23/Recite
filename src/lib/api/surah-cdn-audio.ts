import { ENV } from "@/config";

export const DEFAULT_SURAH_AUDIO_BITRATE = 128;
export const DEFAULT_SURAH_AUDIO_EDITION =
  "en.misharyrashidalafasyenglishtranslationsaheehibrahimwalk";

export interface SurahCdnAudioOptions {
  bitrate?: number;
  edition?: string;
}

export function getSurahCdnAudioUrl(
  surahNumber: number,
  options?: SurahCdnAudioOptions,
): string {
  const bitrate = options?.bitrate ?? DEFAULT_SURAH_AUDIO_BITRATE;
  const edition = options?.edition ?? DEFAULT_SURAH_AUDIO_EDITION;
  const baseUrl = ENV.ISLAMIC_NETWORK_CDN_URL;
  return `${baseUrl}/${bitrate}/${edition}/${surahNumber}.mp3`;
}
