import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import type { AudioPlayer } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Haptics } from "@/lib/haptics";

interface AudioPlayerProps {
  player: AudioPlayer;
  status: any;
  isLoadingAudio: boolean;
  scrollTranslateY?: SharedValue<number>;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds == null) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export default function AudioPlayerComponent({
  player,
  status,
  isLoadingAudio,
  scrollTranslateY,
}: AudioPlayerProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const S = useMemo(
    () => createStyles(colors, insets.bottom),
    [colors, insets.bottom],
  );

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Keep loader active until audio duration is known — prevents 0:00 flash
  const isDurationReady = (status.duration ?? 0) > 0;
  const isPlayerLoading = isLoadingAudio || !isDurationReady;

  // Reanimated sliding animation logic
  const animatedStyle = useAnimatedStyle(() => {
    const scrollOffset = scrollTranslateY ? scrollTranslateY.value : 0;
    // Keep player locked visible on screen if audio is playing
    const effectiveOffset = status.playing ? 0 : scrollOffset;
    return {
      transform: [{ translateY: effectiveOffset }],
    };
  });

  // Sync sliderValue with player's currentTime when not dragging
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(status.currentTime || 0);
    }
  }, [status.currentTime, isDragging]);

  const cycleSpeed = useCallback(() => {
    Haptics.light();
    const nextSpeed =
      playbackSpeed === 1.0 ? 1.25 :
      playbackSpeed === 1.25 ? 1.5 :
      playbackSpeed === 1.5 ? 2.0 : 1.0;
    setPlaybackSpeed(nextSpeed);
    player.setPlaybackRate(nextSpeed);
  }, [playbackSpeed, player]);

  const handlePlayPause = useCallback(() => {
    Haptics.light();
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [status.playing, player]);

  const handleSkipBack = useCallback(() => {
    player.seekTo(Math.max(0, status.currentTime - 10));
  }, [player, status.currentTime]);

  const handleSkipForward = useCallback(() => {
    player.seekTo(Math.min(status.duration, status.currentTime + 10));
  }, [player, status.currentTime, status.duration]);

  return (
    <Animated.View style={[S.container, animatedStyle]}>
      {/* Progress Bar (Slider) */}
      <View style={S.progressSection}>
        <AppText variant="caption" color="subtext" align="center" style={S.timeText}>
          {formatTime(isDragging ? sliderValue : status.currentTime)}
        </AppText>

        <Slider
          style={S.slider}
          minimumValue={0}
          maximumValue={status.duration || 1}
          value={sliderValue}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border + "80"}
          thumbTintColor={colors.primary}
          onValueChange={(val) => {
            setIsDragging(true);
            setSliderValue(val);
          }}
          onSlidingComplete={(val) => {
            player.seekTo(val);
            setIsDragging(false);
          }}
        />

        <AppText variant="caption" color="subtext" align="center" style={S.timeText}>
          {formatTime(status.duration)}
        </AppText>
      </View>

      {/* Control Buttons */}
      <View style={S.controlsRow}>
        {/* Spacer to balance speed button on left side */}
        <View style={S.spacerButton} />

        {/* Center Playback Controls */}
        <View style={S.centerControls}>
          {/* Skip backward 10s */}
          <TouchableOpacity
            onPress={handleSkipBack}
            style={S.skipButton}
          >
            <Ionicons name="play-back" size={rs.icon(19)} color={colors.text} />
          </TouchableOpacity>

          {/* Play/Pause Main Button (Exact Center) */}
          <TouchableOpacity
            onPress={handlePlayPause}
            disabled={isPlayerLoading}
            style={S.playPauseButton}
          >
            {isPlayerLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={status.playing ? "pause" : "play"}
                size={rs.icon(26)}
                color="#fff"
                style={!status.playing ? { marginLeft: rs.space(2.5) } : undefined}
              />
            )}
          </TouchableOpacity>

          {/* Skip forward 10s */}
          <TouchableOpacity
            onPress={handleSkipForward}
            style={S.skipButton}
          >
            <Ionicons name="play-forward" size={rs.icon(19)} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Speed Selector (Far Right Badge Button) */}
        <TouchableOpacity onPress={cycleSpeed} style={S.speedButton}>
          <AppText variant="caption" family="title" color="#FFFFFF">
            {playbackSpeed === 1 ? "1.0" : playbackSpeed}x
          </AppText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: any, bottomInset: number) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: rs.space(20),
      borderTopRightRadius: rs.space(20),
      paddingTop: rs.space(12),
      paddingBottom: Math.max(bottomInset + rs.space(8), rs.space(22)),
      paddingHorizontal: rs.space(18),
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 20,
    },
    progressSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: rs.space(10),
    },
    timeText: {
      minWidth: rs.space(38),
      fontVariant: ["tabular-nums"],
    },
    slider: {
      flex: 1,
      height: rs.space(22),
      marginHorizontal: rs.space(6),
    },
    controlsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    centerControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs.space(20),
    },
    skipButton: {
      width: rs.space(42),
      height: rs.space(42),
      borderRadius: rs.space(21),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    speedButton: {
      width: rs.space(38),
      height: rs.space(38),
      borderRadius: rs.space(19),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    spacerButton: {
      width: rs.space(38),
      height: rs.space(38),
    },
    playPauseButton: {
      width: rs.space(54),
      height: rs.space(54),
      borderRadius: rs.space(27),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
  });
