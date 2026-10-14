import {
  type AudioPlayer,
  type AudioMetadata,
  type AudioLockScreenOptions,
} from "expo-audio";
import { useEffect, useRef } from "react";

export interface UseBackgroundPlayOptions {
  /** The expo-audio player instance */
  player: AudioPlayer | null;
  /** Whether audio is currently playing (e.g. status?.playing) */
  isPlaying?: boolean;
  /** Metadata to display on the system lock screen and notification shade */
  metadata?: AudioMetadata | null;
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
 * - Activates system lock-screen controls when playback begins.
 * - Efficiently updates metadata only when title/artist/album/artwork changes.
 * - Cleans up lock screen controls on unmount.
 */
export function useBackgroundPlay({
  player,
  isPlaying = false,
  metadata,
  enabled = true,
  lockScreenOptions = DEFAULT_LOCK_SCREEN_OPTIONS,
}: UseBackgroundPlayOptions) {
  const isLockScreenActiveRef = useRef(false);
  const previousMetadataRef = useRef<AudioMetadata | null>(null);
  const playerRef = useRef(player);
  playerRef.current = player; // always up to date without re-triggering effects

  // Activate or update lock screen metadata in one effect
  useEffect(() => {
    if (!player || !enabled || !metadata) return;

    const prev = previousMetadataRef.current;
    const metadataChanged =
      prev?.title !== metadata.title ||
      prev?.artist !== metadata.artist ||
      prev?.albumTitle !== metadata.albumTitle ||
      prev?.artworkUrl !== metadata.artworkUrl;

    try {
      if (isPlaying && !isLockScreenActiveRef.current) {
        player.setActiveForLockScreen(true, metadata, lockScreenOptions);
        isLockScreenActiveRef.current = true;
        previousMetadataRef.current = metadata;
      } else if (isLockScreenActiveRef.current && metadataChanged) {
        player.updateLockScreenMetadata(metadata);
        previousMetadataRef.current = metadata;
      }
    } catch (e) {
      console.warn("[useBackgroundPlay] lock screen error:", e);
    }
  }, [player, enabled, isPlaying, metadata, lockScreenOptions]);

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
