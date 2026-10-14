import {
  DEFAULT_RECITER_ID,
  RECITER_OPTIONS,
  RECITERS_IMAGES,
  getSurahName,
} from "@/constants";
import { useBackgroundPlay } from "@/hooks/useBackgroundPlay";
import { getChapterAudio } from "@/lib/api";
import { getLocalAudioPath, getLocalTextData } from "@/services/downloadService";
import { useDownloadsStore } from "@/store/downloadsStore";
import { useLanguageStore } from "@/store/languageStore";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { useQuery } from "@tanstack/react-query";
import { Asset } from "expo-asset";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  type AudioMetadata,
} from "expo-audio";
import { useEffect, useMemo, useRef, useState } from "react";

export interface AudioTimestamp {
  verse_key: string;
  timestamp_from: number;
  timestamp_to: number; // in ms
}

export interface QuranAudioMetadataOptions {
  localizedName?: string;
  arabicName?: string;
}

export { RECITER_OPTIONS };

export function useQuranAudio(
  chapterId: number,
  enabled: boolean = true,
  metadataOptions?: QuranAudioMetadataOptions,
) {
  const { reciterId: globalReciterId, setReciterId: setReciterIdInStore } =
    useQuranSettingsStore();
  const reciterId = globalReciterId || DEFAULT_RECITER_ID;
  const language = useLanguageStore((s) => s.language);

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

  // Reciter & Surah metadata for lock screen & system notification
  const activeReciter = useMemo(
    () => RECITER_OPTIONS.find((r) => r.id === reciterId) ?? RECITER_OPTIONS[0],
    [reciterId],
  );

  // Resolve reciter artwork local/remote URI for lock screen & notification controls
  const [reciterArtworkUri, setReciterArtworkUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;
    const avatarModule = RECITERS_IMAGES[reciterId] || RECITERS_IMAGES[DEFAULT_RECITER_ID];
    if (!avatarModule) {
      setReciterArtworkUri(undefined);
      return;
    }

    try {
      const asset = Asset.fromModule(avatarModule);
      if (asset.localUri) {
        setReciterArtworkUri(asset.localUri);
      } else {
        asset
          .downloadAsync()
          .then(() => {
            if (isMounted) {
              setReciterArtworkUri(asset.localUri || asset.uri);
            }
          })
          .catch(() => {
            if (isMounted) {
              setReciterArtworkUri(asset.uri);
            }
          });
      }
    } catch {
      if (isMounted) setReciterArtworkUri(undefined);
    }

    return () => {
      isMounted = false;
    };
  }, [reciterId]);

  const surahName = useMemo(
    () => metadataOptions?.localizedName || getSurahName(chapterId, language),
    [chapterId, language, metadataOptions?.localizedName],
  );

  const lockScreenMetadata = useMemo<AudioMetadata>(() => {
    const surahDisplay = metadataOptions?.arabicName
      ? `${surahName} (${metadataOptions.arabicName})`
      : surahName;

    return {
      title: surahDisplay,
      artist: activeReciter.label,
      albumTitle: "The Noble Quran",
      artworkUrl: reciterArtworkUri,
    };
  }, [surahName, metadataOptions?.arabicName, activeReciter.label, reciterArtworkUri]);

  // Delegate background playback & lock screen media controls to reusable hook
  useBackgroundPlay({
    player: enabled ? player : null,
    isPlaying: status?.playing,
    metadata: lockScreenMetadata,
    enabled,
  });

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
