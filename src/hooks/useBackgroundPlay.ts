import {
  type AudioPlayer,
  type AudioMetadata,
  type AudioLockScreenOptions,
} from "expo-audio";
import { useEffect, useMemo, useRef, useState } from "react";
import { Asset } from "expo-asset";
import { DEFAULT_RECITER_ID, RECITERS_IMAGES } from "@/constants";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";

export interface UseBackgroundPlayOptions {
  /** The expo-audio player instance */
  player: AudioPlayer | null;
  /** Whether audio is currently playing (e.g. status?.playing) */
  isPlaying?: boolean;
  /** Metadata to display on the system lock screen and notification shade */
  metadata?: AudioMetadata | null;
  /** Optional reciter ID to override or specify reciter avatar */
  reciterId?: number | null;
  /** Optional direct image asset/module to display as lock screen artwork */
  artworkModule?: any;
  /** Whether background audio feature is enabled */
  enabled?: boolean;
  /** Optional lock screen buttons configuration */
  lockScreenOptions?: AudioLockScreenOptions;
}

const DEFAULT_LOCK_SCREEN_OPTIONS: AudioLockScreenOptions = {
  showSeekForward: true,
  showSeekBackward: true,
};

/**
 * Reusable hook to handle background audio playback and lock screen / system media controls.
 * - Automatically resolves and attaches the reciter image to lock screen metadata.
 * - Activates system lock-screen controls when playback begins.
 * - Efficiently updates metadata only when title/artist/album/artwork changes.
 * - Cleans up lock screen controls on unmount.
 */
export function useBackgroundPlay({
  player,
  isPlaying = false,
  metadata,
  reciterId,
  artworkModule,
  enabled = true,
  lockScreenOptions = DEFAULT_LOCK_SCREEN_OPTIONS,
}: UseBackgroundPlayOptions) {
  const isLockScreenActiveRef = useRef(false);
  const previousMetadataRef = useRef<AudioMetadata | null>(null);
  const playerRef = useRef(player);
  playerRef.current = player; // always up to date without re-triggering effects

  // Global reciter ID fallback
  const globalReciterId = useQuranSettingsStore((state) => state.reciterId);
  const effectiveReciterId = reciterId ?? globalReciterId ?? DEFAULT_RECITER_ID;

  // Resolve reciter artwork local/remote URI
  const [resolvedArtworkUri, setResolvedArtworkUri] = useState<string | undefined>(
    metadata?.artworkUrl,
  );

  useEffect(() => {
    // If explicit artworkUrl is already provided, use it
    if (metadata?.artworkUrl) {
      setResolvedArtworkUri(metadata.artworkUrl);
      return;
    }

    let isMounted = true;
    const avatarModule =
      artworkModule ||
      RECITERS_IMAGES[effectiveReciterId] ||
      RECITERS_IMAGES[DEFAULT_RECITER_ID];

    if (!avatarModule) {
      setResolvedArtworkUri(undefined);
      return;
    }

    try {
      const asset = Asset.fromModule(avatarModule);
      if (asset.localUri) {
        setResolvedArtworkUri(asset.localUri);
      } else {
        asset
          .downloadAsync()
          .then(() => {
            if (isMounted) {
              setResolvedArtworkUri(asset.localUri || asset.uri);
            }
          })
          .catch(() => {
            if (isMounted) {
              setResolvedArtworkUri(asset.uri);
            }
          });
      }
    } catch {
      if (isMounted) setResolvedArtworkUri(undefined);
    }

    return () => {
      isMounted = false;
    };
  }, [metadata?.artworkUrl, effectiveReciterId, artworkModule]);

  // Combine metadata with resolved reciter artwork
  const fullMetadata = useMemo<AudioMetadata | null>(() => {
    if (!metadata) return null;
    return {
      ...metadata,
      artworkUrl: metadata.artworkUrl || resolvedArtworkUri,
    };
  }, [metadata, resolvedArtworkUri]);

  // Activate or update lock screen metadata in one effect
  useEffect(() => {
    if (!player || !enabled || !fullMetadata) return;

    const prev = previousMetadataRef.current;
    const metadataChanged =
      prev?.title !== fullMetadata.title ||
      prev?.artist !== fullMetadata.artist ||
      prev?.albumTitle !== fullMetadata.albumTitle ||
      prev?.artworkUrl !== fullMetadata.artworkUrl;

    try {
      if (isPlaying && !isLockScreenActiveRef.current) {
        player.setActiveForLockScreen(true, fullMetadata, lockScreenOptions);
        isLockScreenActiveRef.current = true;
        previousMetadataRef.current = fullMetadata;
      } else if (isLockScreenActiveRef.current && metadataChanged) {
        player.updateLockScreenMetadata(fullMetadata);
        previousMetadataRef.current = fullMetadata;
      }
    } catch (e) {
      console.warn("[useBackgroundPlay] lock screen error:", e);
    }
  }, [player, enabled, isPlaying, fullMetadata, lockScreenOptions]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (playerRef.current && isLockScreenActiveRef.current) {
        try {
          playerRef.current.setActiveForLockScreen(false);
          isLockScreenActiveRef.current = false;
        } catch {}
      }
    };
  }, []); // empty deps — runs only on unmount
}
