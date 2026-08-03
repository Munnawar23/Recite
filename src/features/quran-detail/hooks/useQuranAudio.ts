import { RECITERS_IMAGES } from "@/constants/assets";
import { getChapterAudio } from "@/lib/api/chapter-audio";
import { getLocalAudioPath, getLocalTextData } from "@/services/downloadService";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useQuery } from "@tanstack/react-query";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useMemo, useRef, useState } from "react";

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

  // Fetch audio file details & timestamps (only when NOT downloaded)
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

  // FIX 1: getLocalAudioPath is pure & synchronous — useMemo is sufficient,
  // no need for useState + useEffect which caused an extra render cycle.
  const localUri = useMemo(() => {
    if (enabled && isDownloaded && chapterId) {
      return getLocalAudioPath(chapterId);
    }
    return null;
  }, [enabled, isDownloaded, chapterId]);

  // FIX 2: Always reset localTimestamps immediately when chapterId changes,
  // then populate asynchronously — prevents previous chapter's timestamps
  // bleeding into the next chapter before the async read completes.
  const [localTimestamps, setLocalTimestamps] = useState<AudioTimestamp[]>([]);

  useEffect(() => {
    // Reset immediately so stale timestamps from prior chapter don't linger
    setLocalTimestamps([]);

    if (!enabled || !isDownloaded) return;

    let cancelled = false;
    getLocalTextData(chapterId).then((data) => {
      if (!cancelled && data?.timestamps && data.timestamps.length > 0) {
        setLocalTimestamps(data.timestamps);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [chapterId, isDownloaded, enabled]);

  // Use local file when available, otherwise stream remote URL
  const audioUrl = localUri ?? remoteAudioUrl;

  // FIX 3: Correct priority — when downloaded, local timestamps always win.
  // Remote timestamps (from audioData) are only used when streaming online.
  // Previously the logic was inverted: remote could override local.
  const timestamps = useMemo<AudioTimestamp[]>(() => {
    if (isDownloaded) {
      return localTimestamps;
    }
    return audioData?.timestamps ?? [];
  }, [isDownloaded, localTimestamps, audioData]);

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

  // FIX 4: Keep last known active verse so the highlight doesn't flicker to null
  // during the silent gap between timestamp_to of verse N and timestamp_from of N+1.
  const lastActiveVerseKeyRef = useRef<string | null>(null);

  // Reset ref when chapter changes so stale verse key doesn't carry over
  useEffect(() => {
    lastActiveVerseKeyRef.current = null;
  }, [chapterId]);

  const activeVerseKey = useMemo(() => {
    if (!status.currentTime || timestamps.length === 0) return null;
    const currentTimeMs = status.currentTime * 1000;

    // Exact match — current playback time falls within a verse window
    const active = timestamps.find(
      (ts) =>
        currentTimeMs >= ts.timestamp_from && currentTimeMs <= ts.timestamp_to,
    );

    if (active) {
      lastActiveVerseKeyRef.current = active.verse_key;
      return active.verse_key;
    }

    // In a gap between verses — keep the last highlighted verse visible
    // instead of returning null and causing a flicker
    return lastActiveVerseKeyRef.current;
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
