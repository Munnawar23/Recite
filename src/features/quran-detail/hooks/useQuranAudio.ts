import { RECITERS_IMAGES } from "@/constants/assets";
import { getChapterAudio } from "@/lib/api/chapter-audio";
import { getLocalAudioPath, getLocalTextData } from "@/services/downloadService";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useEffect, useMemo, useState } from "react";

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

  // Check if this chapter has a locally downloaded audio file
  const isDownloaded = useDownloadsStore(
    (s) => s.isDownloaded(chapterId),
  );

  // Fetch audio file details & timestamps (only online if not downloaded offline)
  const { data: audioData, isLoading: isLoadingAudio } = useQuery({
    queryKey: ["chapter-audio", chapterId, reciterId],
    queryFn: () => getChapterAudio(chapterId, reciterId),
    enabled: enabled && !isDownloaded && !!chapterId && chapterId > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours fresh
    gcTime: Infinity,
  });

  const remoteAudioUrl = useMemo(() => {
    if (!audioData?.audio_url) return null;
    let url = audioData.audio_url;
    if (url.startsWith("//")) {
      url = `https:${url}`;
    }
    return url;
  }, [audioData]);

  // Synchronously compute initial localUri if downloaded to prevent loader delay
  const initialLocalUri = useMemo(() => {
    if (enabled && isDownloaded && chapterId) {
      return getLocalAudioPath(chapterId);
    }
    return null;
  }, [enabled, isDownloaded, chapterId]);

  const [localUri, setLocalUri] = useState<string | null>(initialLocalUri);

  useEffect(() => {
    if (!enabled || !isDownloaded) {
      setLocalUri(null);
      return;
    }
    const path = getLocalAudioPath(chapterId);
    setLocalUri(path);
  }, [chapterId, isDownloaded, enabled]);

  const [localTimestamps, setLocalTimestamps] = useState<AudioTimestamp[]>([]);

  useEffect(() => {
    if (!enabled || !isDownloaded) {
      setLocalTimestamps([]);
      return;
    }
    getLocalTextData(chapterId).then((data) => {
      if (data?.timestamps && data.timestamps.length > 0) {
        setLocalTimestamps(data.timestamps);
      }
    });
  }, [chapterId, isDownloaded, enabled]);

  // Use local file when available, otherwise stream remote URL
  const audioUrl = localUri ?? remoteAudioUrl;

  const timestamps = useMemo<AudioTimestamp[]>(() => {
    if (audioData?.timestamps && audioData.timestamps.length > 0) {
      return audioData.timestamps;
    }
    return localTimestamps;
  }, [audioData, localTimestamps]);

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

  return {
    player: enabled ? player : null,
    status: enabled ? status : null,
    activeVerseKey: enabled ? activeVerseKey : null,
    isLoadingAudio: enabled ? isLoadingAudio : false,
    reciterId,
    setReciterId: setReciterIdInStore,
    timestamps: enabled ? timestamps : [],
    // Expose for DownloadCard & UI
    audioUrl: enabled ? remoteAudioUrl : null,
    audioTotalBytes: enabled ? (audioData?.file_size ?? null) : null,
    isPlayingLocally: enabled ? !!localUri : false,
  };
}
