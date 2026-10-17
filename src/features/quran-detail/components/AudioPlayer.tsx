import React, { useMemo } from "react";
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import Animated, { type SharedValue } from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import type { AudioPlayer, AudioStatus } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeColors } from "@/theme";
import {
  formatTime,
  useAudioPlayer,
} from "../hooks/useAudioPlayer";

interface AudioPlayerProps {
  player: AudioPlayer;
  status: AudioStatus | null;
  isLoadingAudio: boolean;
  scrollTranslateY?: SharedValue<number>;
}

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

  const {
    sliderValue,
    isDragging,
    playbackSpeed,
    isRepeating,
    isPlayerLoading,
    miniPlayerAnimatedStyle,
    cycleSpeed,
    toggleRepeat,
    handlePlayPause,
    handleSkipBack,
    handleSkipForward,
    handleSliderValueChange,
    handleSlidingComplete,
  } = useAudioPlayer({
    player,
    status,
    isLoadingAudio,
    scrollTranslateY,
  });

  return (
    <Animated.View style={[S.container, miniPlayerAnimatedStyle]}>
      {/* Progress Bar (Slider) */}
      <View style={S.progressSection}>
        <AppText variant="caption" color="subtext" align="center" style={S.timeText}>
          {formatTime(sliderValue)}
        </AppText>

        <Slider
          style={S.slider}
          minimumValue={0}
          maximumValue={status?.duration && status.duration > 0 ? status.duration : 1}
          value={Math.min(
            Math.max(0, sliderValue),
            status?.duration && status.duration > 0 ? status.duration : 1,
          )}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border + "80"}
          thumbTintColor={colors.primary}
          onValueChange={handleSliderValueChange}
          onSlidingComplete={handleSlidingComplete}
        />

        <AppText variant="caption" color="subtext" align="center" style={S.timeText}>
          {formatTime(status?.duration || 0)}
        </AppText>
      </View>

      {/* Control Buttons: 5 symmetric items with Play/Pause exactly centered */}
      <View style={S.controlsRow}>
        {/* 1. Repeat / Loop Toggle */}
        <TouchableOpacity
          onPress={toggleRepeat}
          style={[S.sideButton, isRepeating && S.repeatButtonActive]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isRepeating ? "Disable repeat" : "Enable repeat"}
        >
          <Ionicons
            name="repeat"
            size={rs.icon(20)}
            color={isRepeating ? colors.primary : colors.text}
          />
          {isRepeating && <View style={[S.repeatDot, { backgroundColor: colors.primary }]} />}
        </TouchableOpacity>

        {/* 2. Skip backward 10s */}
        <TouchableOpacity
          onPress={handleSkipBack}
          style={S.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip backward 10 seconds"
        >
          <MaterialIcons name="replay-10" size={rs.icon(22)} color={colors.text} />
        </TouchableOpacity>

        {/* 3. Play/Pause Main Button (Exact Center) */}
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={isPlayerLoading}
          style={S.playPauseButton}
          accessibilityRole="button"
          accessibilityLabel={
            isPlayerLoading
              ? "Loading audio"
              : status?.playing
                ? "Pause"
                : "Play"
          }
        >
          {isPlayerLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={status?.playing ? "pause" : "play"}
              size={rs.icon(26)}
              color="#fff"
              style={!status?.playing ? { marginLeft: rs.space(2.5) } : undefined}
            />
          )}
        </TouchableOpacity>

        {/* 4. Skip forward 10s */}
        <TouchableOpacity
          onPress={handleSkipForward}
          style={S.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip forward 10 seconds"
        >
          <MaterialIcons name="forward-10" size={rs.icon(22)} color={colors.text} />
        </TouchableOpacity>

        {/* 5. Speed Selector */}
        <TouchableOpacity
          onPress={cycleSpeed}
          style={S.speedButton}
          accessibilityRole="button"
          accessibilityLabel={`Playback speed ${playbackSpeed % 1 === 0 ? `${playbackSpeed}.0` : playbackSpeed}x`}
        >
          <AppText variant="caption" family="title" color="#FFFFFF">
            {`${playbackSpeed % 1 === 0 ? `${playbackSpeed}.0` : playbackSpeed}x`}
          </AppText>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, bottomInset: number) =>
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
      paddingHorizontal: rs.space(12),
    },
    sideButton: {
      width: rs.space(38),
      height: rs.space(38),
      borderRadius: rs.space(19),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      position: "relative",
    },
    repeatButtonActive: {
      backgroundColor: colors.primary + "18",
    },
    repeatDot: {
      position: "absolute",
      bottom: rs.space(4),
      width: rs.space(4),
      height: rs.space(4),
      borderRadius: rs.space(2),
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
