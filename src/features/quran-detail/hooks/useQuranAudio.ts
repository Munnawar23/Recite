import { RECITERS_IMAGES } from "@/constants/assets";
import { getChapterAudio } from "@/lib/api/quran-data";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useMemo } from "react";

export interface AudioTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number; // in ms
}

export const RECITER_OPTIONS = [
  {
    label: "Mishary Rashid Alafasy",
    id: 7,
    avatar: RECITERS_IMAGES[7],
  },
  {
    label: "Yasser Al-Dossari",
    id: 161,
    avatar: RECITERS_IMAGES[161],
  },
  {
    label: "AbdulBaset AbdulSamad",
    id: 2,
    avatar: RECITERS_IMAGES[2],
  },
  {
    label: "Abu Bakr al-Shatri",
    id: 4,
    avatar: RECITERS_IMAGES[4],
  },
  {
    label: "Mahmoud Khalil Al-Husary",
    id: 12,
    avatar: RECITERS_IMAGES[12],
  },
  {
    label: "Hani ar-Rifai",
    id: 5,
    avatar: RECITERS_IMAGES[5],
  },
];

export function useQuranAudio(chapterId: number, enabled: boolean = true) {
  const { reciterId: globalReciterId, setReciterId: setReciterIdInStore } =
    useQuranSettingsStore();
  const reciterId = globalReciterId || 7;

  // Fetch audio file details & timestamps
  const { data: audioData, isLoading: isLoadingAudio } = useQuery({
    queryKey: ["chapter-audio", chapterId, reciterId],
    queryFn: () => getChapterAudio(chapterId, reciterId),
    enabled: enabled && !!chapterId && chapterId > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in AsyncStorage persistence
  });

  const audioUrl = useMemo(() => {
    if (!audioData?.audio_url) return null;
    let url = audioData.audio_url;
    if (url.startsWith("//")) {
      url = `https:${url}`;
    }
    return url;
  }, [audioData]);

  const timestamps = useMemo<AudioTimestamp[]>(() => {
    return audioData?.timestamps || [];
  }, [audioData]);

  // Initialize the expo-audio player
  const player = useAudioPlayer(
    enabled && audioUrl ? { uri: audioUrl } : undefined,
  );
  const status = useAudioPlayerStatus(player);

  // Replace source when audioUrl changes
  useEffect(() => {
    if (enabled && audioUrl) {
      player.replace({ uri: audioUrl });
    }
  }, [enabled, audioUrl, player]);

  // Find the active verse key based on current time
  const activeVerseKey = useMemo(() => {
    if (!status.currentTime || timestamps.length === 0) return null;
    const currentTimeMs = status.currentTime * 1000;

    const active = timestamps.find(
      (ts) =>
        currentTimeMs >= ts.timestamp_from && currentTimeMs <= ts.timestamp_to,
    );

    return active ? active.verse_key : null;
  }, [status.currentTime, timestamps]);

  const audioSize = useMemo(() => {
    if (!audioData?.file_size) return null;
    return (audioData.file_size / (1024 * 1024)).toFixed(1);
  }, [audioData]);

  return {
    player: enabled ? player : null,
    status: enabled ? status : null,
    activeVerseKey: enabled ? activeVerseKey : null,
    isLoadingAudio: enabled ? isLoadingAudio : false,
    reciterId,
    setReciterId: setReciterIdInStore,
    timestamps: enabled ? timestamps : [],
    audioSize: enabled ? audioSize : null,
  };
}
