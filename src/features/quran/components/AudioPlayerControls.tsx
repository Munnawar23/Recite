import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { scale, verticalScale } from "react-native-size-matters";
import { RECITER_OPTIONS } from "../hooks/useQuranAudio";
import CommonModal from "@/components/ui/CommonModal";
import Slider from "@react-native-community/slider";
import type { AudioPlayer } from "expo-audio";

interface AudioPlayerControlsProps {
  player: AudioPlayer;
  status: any;
  isLoadingAudio: boolean;
  reciterId: number;
  onReciterChange: (id: number) => void;
}

export default function AudioPlayerControls({
  player,
  status,
  isLoadingAudio,
  reciterId,
  onReciterChange,
}: AudioPlayerControlsProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const S = createStyles(colors, fontFamily, fontSize);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === null || seconds === undefined) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const dropdownData = RECITER_OPTIONS.map((r) => ({
    label: r.label,
    value: String(r.id),
  }));

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Sync sliderValue with player's currentTime when not dragging
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(status.currentTime || 0);
    }
  }, [status.currentTime, isDragging]);

  const cycleSpeed = () => {
    let nextSpeed = 1.0;
    if (playbackSpeed === 1.0) nextSpeed = 1.25;
    else if (playbackSpeed === 1.25) nextSpeed = 1.5;
    else if (playbackSpeed === 1.5) nextSpeed = 2.0;
    else nextSpeed = 1.0;

    setPlaybackSpeed(nextSpeed);
    player.setPlaybackRate(nextSpeed);
  };

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={S.container}>
      {/* Reciter Selector */}
      <View style={S.reciterRow}>
        <Text style={S.reciterLabel}>Reciter:</Text>
        <View style={S.dropdownContainer}>
          <CommonModal
            data={dropdownData}
            value={String(reciterId)}
            onChange={(item) => onReciterChange(Number(item.value))}
            placeholder="Select Reciter"
          />
        </View>
      </View>

      {/* Progress Bar (Slider) */}
      <View style={S.progressSection}>
        <Text style={S.timeText}>{formatTime(isDragging ? sliderValue : status.currentTime)}</Text>

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

        <Text style={S.timeText}>{formatTime(status.duration)}</Text>
      </View>

      {/* Control Buttons */}
      <View style={S.controlsRow}>
        {/* Speed Selector */}
        <TouchableOpacity onPress={cycleSpeed} style={S.speedButton}>
          <Text style={S.speedButtonText}>{playbackSpeed === 1 ? "1.0" : playbackSpeed}x</Text>
        </TouchableOpacity>

        {/* Skip backward 10s */}
        <TouchableOpacity
          onPress={() => player.seekTo(Math.max(0, status.currentTime - 10))}
          style={S.skipButton}
        >
          <Ionicons name="play-back-outline" size={scale(24)} color={colors.text} />
        </TouchableOpacity>

        {/* Play/Pause Main Button */}
        <TouchableOpacity
          onPress={handlePlayPause}
          disabled={isLoadingAudio}
          style={S.playPauseButton}
        >
          {isLoadingAudio ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={status.playing ? "pause" : "play"}
              size={scale(28)}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        {/* Skip forward 10s */}
        <TouchableOpacity
          onPress={() => player.seekTo(Math.min(status.duration, status.currentTime + 10))}
          style={S.skipButton}
        >
          <Ionicons name="play-forward-outline" size={scale(24)} color={colors.text} />
        </TouchableOpacity>

        {/* Spacer to keep play/pause button centered */}
        <View style={S.spacerButton} />
      </View>
    </View>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border + "80",
      paddingTop: verticalScale(12),
      paddingBottom: verticalScale(20),
      paddingHorizontal: scale(20),
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 10,
    },
    reciterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: verticalScale(12),
      gap: scale(10),
    },
    reciterLabel: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
      color: colors.text,
    },
    dropdownContainer: {
      flex: 1,
      height: verticalScale(40),
      justifyContent: "center",
    },
    progressSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale(10),
      marginBottom: verticalScale(14),
    },
    timeText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
      color: colors.subtext,
      minWidth: scale(36),
      textAlign: "center",
    },
    slider: {
      flex: 1,
      height: verticalScale(30),
    },
    controlsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(20),
    },
    skipButton: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border + "40",
    },
    speedButton: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(22),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border + "40",
    },
    speedButtonText: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption,
      color: colors.primary,
    },
    spacerButton: {
      width: scale(44),
      height: scale(44),
    },
    playPauseButton: {
      width: scale(56),
      height: scale(56),
      borderRadius: scale(28),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
  });
