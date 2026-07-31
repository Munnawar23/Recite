import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, type SharedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { scale, verticalScale } from "react-native-size-matters";
import Slider from "@react-native-community/slider";
import type { AudioPlayer } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RECITER_OPTIONS } from "../hooks/useQuranAudio";
import { Haptics } from "@/lib/haptics";
import CommonModal, { DropdownItem } from "@/components/ui/CommonModal";
import { MessageModal } from "@/components/common/MessageModal";
import { useTranslation } from "react-i18next";

interface AudioPlayerControlsProps {
  player: AudioPlayer;
  status: any;
  isLoadingAudio: boolean;
  reciterId?: number;
  onReciterChange?: (id: number) => void;
  scrollTranslateY?: SharedValue<number>;
}

export default function AudioPlayerControls({
  player,
  status,
  isLoadingAudio,
  reciterId = 7,
  onReciterChange,
  scrollTranslateY,
}: AudioPlayerControlsProps) {
  const { colors, fontFamily, fontSize } = useAppTheme();
  const { isOffline } = useNetworkStatus();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const S = createStyles(colors, fontFamily, fontSize, insets.bottom);

  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const activeReciter = RECITER_OPTIONS.find((r) => r.id === reciterId);

  const reciterModalData = RECITER_OPTIONS.map((r) => ({
    label: r.label,
    value: String(r.id),
  }));

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

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Reanimated sliding animation logic
  const animatedStyle = useAnimatedStyle(() => {
    const scrollOffset = scrollTranslateY ? scrollTranslateY.value : 0;
    // Keep player locked visible on screen if audio is playing or reciter modal is open
    const effectiveOffset = (status.playing || showReciterModal || showOfflineModal) ? 0 : scrollOffset;
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

  const cycleSpeed = () => {
    Haptics.medium();
    let nextSpeed = 1.0;
    if (playbackSpeed === 1.0) nextSpeed = 1.25;
    else if (playbackSpeed === 1.25) nextSpeed = 1.5;
    else if (playbackSpeed === 1.5) nextSpeed = 2.0;
    else nextSpeed = 1.0;

    setPlaybackSpeed(nextSpeed);
    player.setPlaybackRate(nextSpeed);
  };

  const handlePlayPause = () => {
    Haptics.medium();
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <Animated.View style={[S.container, animatedStyle]}>
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
        {/* Reciter Avatar Button (Left Side) */}
        <TouchableOpacity
          onPress={() => {
            Haptics.medium();
            if (isOffline) {
              setShowOfflineModal(true);
            } else {
              setShowReciterModal(true);
            }
          }}
          activeOpacity={0.7}
        >
          {activeReciter?.avatar ? (
            <Image source={activeReciter.avatar} style={S.reciterAvatar} />
          ) : (
            <View style={S.reciterAvatarFallback}>
              <Ionicons name="person" size={scale(18)} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Offline MessageModal */}
        <MessageModal
          visible={showOfflineModal}
          onClose={() => setShowOfflineModal(false)}
          title={t("common.offlineAudioPreviewTitle", "Offline Mode")}
          message={t(
            "common.offlineReciterChangeMessage",
            "Changing reciters requires an internet connection. Connect to the internet to switch reciters."
          )}
          icon="wifi-outline"
        />

        {/* Reciter CommonModal Selection */}
        <CommonModal
          data={reciterModalData}
          value={String(reciterId)}
          onChange={(item: DropdownItem) => {
            onReciterChange?.(Number(item.value));
            setShowReciterModal(false);
          }}
          placeholder="Select Reciter"
          visible={showReciterModal}
          onClose={() => setShowReciterModal(false)}
        />

        {/* Skip backward 10s */}
        <TouchableOpacity
          onPress={() => player.seekTo(Math.max(0, status.currentTime - 10))}
          style={S.skipButton}
        >
          <Ionicons name="play-back-outline" size={scale(22)} color={colors.text} />
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
              size={scale(24)}
              color="#fff"
              style={!status.playing ? { marginLeft: scale(2) } : undefined}
            />
          )}
        </TouchableOpacity>

        {/* Skip forward 10s */}
        <TouchableOpacity
          onPress={() => player.seekTo(Math.min(status.duration, status.currentTime + 10))}
          style={S.skipButton}
        >
          <Ionicons name="play-forward-outline" size={scale(22)} color={colors.text} />
        </TouchableOpacity>

        {/* Speed Selector (Far Right) */}
        <TouchableOpacity onPress={cycleSpeed} style={S.speedButton}>
          <Text style={S.speedButtonText}>{playbackSpeed === 1 ? "1.0" : playbackSpeed}x</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, bottomInset: number) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border + "80",
      paddingTop: verticalScale(8),
      paddingBottom: Math.max(bottomInset + verticalScale(8), verticalScale(22)),
      paddingHorizontal: scale(16),
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 10,
    },
    progressSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: scale(6),
      marginBottom: verticalScale(4),
    },
    timeText: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption * 0.9,
      color: colors.subtext,
      minWidth: scale(32),
      textAlign: "center",
    },
    slider: {
      flex: 1,
      height: verticalScale(20),
    },
    controlsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(14),
    },
    reciterAvatar: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      borderWidth: 1,
      borderColor: colors.primary + "40",
    },
    reciterAvatarFallback: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "40",
    },
    skipButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border + "40",
    },
    speedButton: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border + "40",
    },
    speedButtonText: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.caption * 0.9,
      color: colors.primary,
    },
    spacerButton: {
      width: scale(36),
      height: scale(36),
    },
    playPauseButton: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(23),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
  });
