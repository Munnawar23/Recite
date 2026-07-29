import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { getChapterAudio } from "@/lib/api/quran-data";
import { useDownloadsStore } from "@/store/downloadsStore";

export interface AudioTimestamp {
  verse_key: string;
  timestamp_from: number; // in ms
  timestamp_to: number;   // in ms
}

export const RECITER_OPTIONS = [
  { label: "Mishary Rashid Alafasy", id: 7 },
  { label: "AbdulBaset AbdulSamad (Murattal)", id: 2 },
  { label: "AbdulBaset AbdulSamad (Mujawwad)", id: 1 },
  { label: "Abu Bakr al-Shatri", id: 4 },
  { label: "Mahmoud Khalil Al-Husary", id: 12 },
  { label: "Hani ar-Rifai", id: 5 },
];

export function useQuranAudio(chapterId: number, enabled: boolean = true) {
  const [reciterId, setReciterId] = useState<number>(7);
  const { downloadedChapters } = useDownloadsStore();
  const localChapter = downloadedChapters[chapterId];
  const hasLocalAudio = !!localChapter?.localAudioUri;

  // Fetch audio file details & timestamps
  const { data: audioData, isLoading: isLoadingAudio } = useQuery({
    queryKey: ["chapter-audio", chapterId, reciterId],
    queryFn: () => getChapterAudio(chapterId, reciterId),
    enabled: enabled && !hasLocalAudio && !!chapterId && chapterId > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in AsyncStorage persistence
  });

  const audioUrl = useMemo(() => {
    if (hasLocalAudio) return localChapter.localAudioUri;
    if (!audioData?.audio_url) return null;
    let url = audioData.audio_url;
    if (url.startsWith("//")) {
      url = `https:${url}`;
    }
    return url;
  }, [audioData, hasLocalAudio, localChapter]);

  const timestamps = useMemo<AudioTimestamp[]>(() => {
    if (hasLocalAudio) return localChapter.timestamps || [];
    return audioData?.timestamps || [];
  }, [audioData, hasLocalAudio, localChapter]);

  // Initialize the expo-audio player
  const player = useAudioPlayer(enabled && audioUrl ? { uri: audioUrl } : undefined);
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
      (ts) => currentTimeMs >= ts.timestamp_from && currentTimeMs <= ts.timestamp_to
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
    setReciterId,
    timestamps: enabled ? timestamps : [],
    audioSize: enabled ? audioSize : null,
  };
}
