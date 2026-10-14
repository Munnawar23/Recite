import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AudioPlayer } from "expo-audio";
import { useTranslation } from "react-i18next";

import { AppText } from "@/components";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { Haptics } from "@/lib/haptics";
import { type ThemeColors } from "@/theme";
import { useDownloadsStore } from "@/store/downloadsStore";
import {
  formatTime,
  useAudioPlayer,
} from "../hooks/useAudioPlayer";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = Math.min(
  SCREEN_WIDTH - scale(80),
  scale(240),
  SCREEN_HEIGHT * 0.28,
);

interface AudioPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  onDismissToTabs?: () => void;
  onDismissToDetail?: () => void;
  // Audio playback controls & status
  player: AudioPlayer | null;
  status: any;
  isLoadingAudio: boolean;
  activeVerseKey?: string | null;
  // Chapter details
  chapterId: number;
  arabicName?: string;
  localizedName?: string;
  versesCount?: string;
  chapterType?: string;
  // Reciter metadata
  reciterName?: string;
  isPlayingLocally?: boolean;
}

export default function AudioPlayerModal({
  visible,
  onClose,
  onDismissToTabs,
  onDismissToDetail,
  player,
  status,
  isLoadingAudio,
  activeVerseKey,
  chapterId,
  arabicName,
  localizedName,
  versesCount,
  chapterType,
  reciterName,
  isPlayingLocally = false,
}: AudioPlayerModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isDownloaded = useDownloadsStore((state) => !!state.downloads[chapterId]);
  const isAudioOffline = isPlayingLocally || isDownloaded;
  const {
    colors,
    isDark,
    closePlayer,
    dismissToTabs,
    closeToDetail,
    panGesture,
    animatedSheetStyle,
    animatedBackdropStyle,
    selectedReciter,
    localizedSurah,
    nextSurah,
    nextChapterId,
    sliderValue,
    isDragging,
    playbackSpeed,
    isRepeating,
    isPlayerBusy,
    handlePlayPause,
    handleSkipBack,
    handleSkipForward,
    cycleSpeed,
    toggleRepeat,
    handlePlayNext,
    handleSliderValueChange,
    handleSlidingComplete,
    primaryGradientColors,
    depthOverlayColors,
  } = useAudioPlayer({
    visible,
    onClose,
    onDismissToTabs,
    onDismissToDetail,
    player,
    status,
    isLoadingAudio,
    chapterId,
    arabicName,
    localizedName,
    reciterName,
  });

  const S = useMemo(
    () => createStyles(colors, insets.top, insets.bottom, isDark),
    [colors, insets.top, insets.bottom, isDark],
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closePlayer}
    >
      <GestureHandlerRootView style={S.rootContainer}>
        {/* Semi-transparent Dimmed Backdrop */}
        <TouchableWithoutFeedback onPress={closePlayer}>
          <Animated.View style={[S.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Spotify-style Player Sheet */}
        <Animated.View style={[S.sheetContainer, animatedSheetStyle]}>
          {/* 1. Base Linear Gradient Background */}
          <LinearGradient
            colors={primaryGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* 2. Atmospheric Depth Gradient Tint Overlay */}
          <LinearGradient
            colors={depthOverlayColors}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />

              {/* Top Section: Drag Handle & Header Bar */}
              <View style={S.topSection}>
                {/* Drag Indicator Pill (Draggable) */}
                <GestureDetector gesture={panGesture}>
                  <View style={S.dragHandleContainer}>
                    <View style={S.dragHandle} />
                  </View>
                </GestureDetector>

                {/* Top Bar: Back Arrow (Goes to Tabs), Now Playing Title, Close Cross (Shows Quran Detail) */}
                <View style={S.headerRow}>
                  <TouchableOpacity
                    onPress={dismissToTabs}
                    hitSlop={rs.space(12)}
                    style={S.headerIconButton}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Go back to tabs"
                  >
                    <Ionicons
                      name="chevron-back"
                      size={scale(22)}
                      color={colors.text}
                    />
                  </TouchableOpacity>

                  <View style={S.headerTitleContainer}>
                    <AppText
                      variant="bodyLg"
                      family="title"
                      color="text"
                      numberOfLines={1}
                      style={S.headerSurahTitle}
                    >
                      {`${t("common.quran", "Surah")} ${chapterId}: ${localizedSurah.name}`}
                    </AppText>

                    {/* Online / Offline Status Pill */}
                    <View
                      style={[
                        S.playbackSourcePill,
                        isAudioOffline
                          ? S.playbackSourcePillOffline
                          : S.playbackSourcePillOnline,
                      ]}
                    >
                      <Ionicons
                        name={isAudioOffline ? "checkmark-circle" : "globe-outline"}
                        size={scale(11)}
                        color={isAudioOffline ? "#10B981" : colors.primary}
                      />
                      <AppText
                        variant="bodySm"
                        family="title"
                        style={
                          isAudioOffline
                            ? S.playbackSourcePillTextOffline
                            : S.playbackSourcePillTextOnline
                        }
                      >
                        {isAudioOffline
                          ? t("quran.downloadCard.playingOfflineTitle", "Playing Offline")
                          : t("quran.downloadCard.playingOnlineTitle", "Playing Online")}
                      </AppText>
                    </View>
                  </View>

                  {/* View Quran Verses Button: Closes modal and shows Quran detail screen */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.light();
                      closeToDetail();
                    }}
                    hitSlop={rs.space(12)}
                    style={S.headerBookButton}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="View Quran verses"
                  >
                    <Ionicons
                      name="book"
                      size={scale(18)}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Middle Section: Centered Album Artwork & Active Ayah Highlight (Draggable) */}
              <GestureDetector gesture={panGesture}>
                <View style={S.middleSection}>
                  <View style={S.artworkShadow}>
                    {selectedReciter.avatar ? (
                      <Image
                        source={selectedReciter.avatar}
                        style={S.artworkImage}
                        contentFit="cover"
                        transition={300}
                      />
                    ) : (
                      <LinearGradient
                        colors={[colors.primary + "35", colors.card]}
                        style={[S.artworkImage, S.artworkFallback]}
                      >
                        <Ionicons
                          name="musical-notes"
                          size={scale(64)}
                          color={colors.primary}
                        />
                      </LinearGradient>
                    )}
                  </View>

                  {/* Highlighted Active Ayah Pill directly under Reciter Image */}
                  <View style={S.underArtworkAyahBadge}>
                    <Ionicons
                      name="sparkles"
                      size={scale(12)}
                      color={colors.primary}
                    />
                    <AppText
                      variant="bodySm"
                      family="title"
                      color="primary"
                      numberOfLines={1}
                      style={S.underArtworkAyahText}
                    >
                      {`${t("common.verse", "Ayah")} ${activeVerseKey ?? `${chapterId}:1`}`}
                    </AppText>
                  </View>
                </View>
              </GestureDetector>

            {/* Bottom Section: Track Info, Progress, Controls & Up Next Queue */}
            <View style={S.bottomSection}>
              {/* Surah Title & Verse Details */}
              <View style={S.trackInfoRow}>
                <View style={S.trackTextGroup}>
                  <View style={S.surahTitleLine}>
                    <AppText
                      variant="heading"
                      family="heading"
                      color="text"
                      numberOfLines={1}
                      style={S.surahTitleText}
                    >
                      {localizedSurah.name}
                    </AppText>
                    {arabicName ? (
                      <View style={S.arabicBadge}>
                        <AppText
                          variant="cardTitle"
                          family="quran"
                          color="primary"
                          numberOfLines={1}
                        >
                          {arabicName}
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  {/* Metadata Chips: Verses count & Reciter */}
                  <View style={S.metadataChipsRow}>
                    {versesCount ? (
                      <View style={S.metadataChip}>
                        <Ionicons
                          name="book-outline"
                          size={scale(10)}
                          color={colors.subtext}
                        />
                        <AppText
                          variant="caption"
                          family="title"
                          color="subtext"
                        >
                          {t("quran.versesCount", { count: versesCount })}
                        </AppText>
                      </View>
                    ) : null}

                    <View style={S.metadataChip}>
                      <Ionicons
                        name="person-outline"
                        size={scale(10)}
                        color={colors.subtext}
                      />
                      <AppText
                        variant="caption"
                        family="title"
                        color="subtext"
                        numberOfLines={1}
                      >
                        {selectedReciter.label}
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Progress Bar & Timestamps */}
              <View style={S.progressSection}>
                <Slider
                  style={S.slider}
                  minimumValue={0}
                  maximumValue={status?.duration || 1}
                  value={sliderValue}
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={
                    isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.12)"
                  }
                  thumbTintColor={colors.primary}
                  onValueChange={handleSliderValueChange}
                  onSlidingComplete={handleSlidingComplete}
                />

                <View style={S.timeRow}>
                  <AppText variant="caption" color="subtext" style={S.timeText}>
                    {formatTime(isDragging ? sliderValue : status?.currentTime || 0)}
                  </AppText>
                  <AppText variant="caption" color="subtext" style={S.timeText}>
                    {formatTime(status?.duration || 0)}
                  </AppText>
                </View>
              </View>

              {/* Symmetrical 5-Item Playback Controls Row */}
              <View style={S.controlsRow}>
                {/* 1. Playback Speed Pill */}
                <TouchableOpacity
                  onPress={cycleSpeed}
                  style={[
                    S.speedPill,
                    playbackSpeed !== 1 && S.speedPillActive,
                  ]}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Speed ${playbackSpeed}x`}
                >
                  <AppText
                    variant="caption"
                    family="title"
                    style={[
                      S.speedText,
                      playbackSpeed !== 1 && S.speedTextActive,
                    ]}
                  >
                    {playbackSpeed === 1 ? "1.0" : playbackSpeed}x
                  </AppText>
                </TouchableOpacity>

                {/* 2. Skip Backward 10s */}
                <TouchableOpacity
                  onPress={handleSkipBack}
                  hitSlop={rs.space(10)}
                  style={S.skipButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Skip backward 10 seconds"
                >
                  <MaterialIcons
                    name="replay-10"
                    size={scale(26)}
                    color={colors.text}
                  />
                </TouchableOpacity>

                {/* 3. Hero Play / Pause Circle Button with Halo Glow Ring */}
                <TouchableOpacity
                  onPress={handlePlayPause}
                  disabled={isPlayerBusy}
                  style={S.heroPlayContainer}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={status?.playing ? "Pause" : "Play"}
                >
                  <View style={S.heroPlayHalo}>
                    <View style={S.heroPlayButton}>
                      {isPlayerBusy ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons
                          name={status?.playing ? "pause" : "play"}
                          size={scale(30)}
                          color="#FFFFFF"
                          style={!status?.playing ? { marginLeft: scale(3) } : undefined}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* 4. Skip Forward 10s */}
                <TouchableOpacity
                  onPress={handleSkipForward}
                  hitSlop={rs.space(10)}
                  style={S.skipButton}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Skip forward 10 seconds"
                >
                  <MaterialIcons
                    name="forward-10"
                    size={scale(26)}
                    color={colors.text}
                  />
                </TouchableOpacity>

                {/* 5. Repeat / Loop Toggle */}
                <TouchableOpacity
                  onPress={toggleRepeat}
                  hitSlop={rs.space(10)}
                  style={[
                    S.repeatButton,
                    isRepeating && S.repeatButtonActive,
                  ]}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Toggle repeat"
                >
                  <Ionicons
                    name="repeat"
                    size={scale(22)}
                    color={isRepeating ? colors.primary : colors.subtext}
                  />
                  {isRepeating && <View style={S.repeatDot} />}
                </TouchableOpacity>
              </View>

              {/* Up Next Surah Footer Card */}
              <TouchableOpacity
                style={S.upNextContainer}
                activeOpacity={0.8}
                onPress={handlePlayNext}
                accessibilityRole="button"
                accessibilityLabel={`Up next: Surah ${nextChapterId} ${nextSurah.name}`}
              >
                <View style={S.upNextLeft}>
                  <View style={S.upNextBadge}>
                    <Ionicons
                      name="play-forward"
                      size={scale(15)}
                      color={colors.primary}
                    />
                  </View>
                  <View style={S.upNextTextContainer}>
                    <AppText
                      variant="caption"
                      family="title"
                      color="subtext"
                      style={S.upNextLabel}
                    >
                      UP NEXT IN QUEUE
                    </AppText>
                    <AppText
                      variant="body"
                      family="title"
                      color="text"
                      numberOfLines={1}
                    >
                      {`${nextChapterId}. ${nextSurah.name}`}
                    </AppText>
                  </View>
                </View>

                <View style={S.upNextActionBtn}>
                  <AppText
                    variant="caption"
                    family="title"
                    style={S.upNextActionText}
                  >
                    Play Next
                  </AppText>
                  <Ionicons
                    name="chevron-forward"
                    size={scale(14)}
                    color="#FFFFFF"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const createStyles = (
  colors: ThemeColors,
  topInset: number,
  bottomInset: number,
  isDark: boolean,
) =>
  StyleSheet.create({
    rootContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      elevation: 999,
    },
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
    },
    sheetContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? "#070E0F" : "#0d1b1e",
      paddingTop: Math.max(topInset, verticalScale(8)),
      paddingBottom: Math.max(
        bottomInset + verticalScale(8),
        verticalScale(20),
      ),
      paddingHorizontal: scale(22),
      overflow: "hidden",
    },
    topSection: {
      width: "100%",
    },
    dragHandleContainer: {
      alignItems: "center",
      paddingTop: verticalScale(4),
      paddingBottom: verticalScale(8),
    },
    dragHandle: {
      width: scale(38),
      height: verticalScale(4),
      borderRadius: scale(2),
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.25)"
        : "rgba(0, 0, 0, 0.2)",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    headerIconButton: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.07)"
        : "rgba(0, 0, 0, 0.04)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
    },
    headerBookButton: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 5,
      elevation: 4,
    },
    headerTitleContainer: {
      alignItems: "center",
      flex: 1,
      paddingHorizontal: scale(8),
      gap: verticalScale(5),
    },
    headerSurahTitle: {
      marginTop: verticalScale(1),
    },
    middleSection: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: verticalScale(8),
      position: "relative",
    },
    playbackSourcePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: scale(12),
      marginTop: verticalScale(5),
      borderWidth: 1,
    },
    playbackSourcePillOnline: {
      backgroundColor: isDark
        ? `${colors.primary}18`
        : `${colors.primary}12`,
      borderColor: `${colors.primary}35`,
    },
    playbackSourcePillOffline: {
      backgroundColor: isDark
        ? "rgba(16, 185, 129, 0.15)"
        : "rgba(16, 185, 129, 0.12)",
      borderColor: "rgba(16, 185, 129, 0.35)",
    },
    playbackSourcePillTextOnline: {
      color: colors.primary,
    },
    playbackSourcePillTextOffline: {
      color: "#10B981",
    },
    artworkShadow: {
      width: ARTWORK_SIZE,
      height: ARTWORK_SIZE,
      borderRadius: ARTWORK_SIZE / 2,
      backgroundColor: colors.card,
      position: "relative",
      overflow: "hidden",
    },
    artworkImage: {
      width: "100%",
      height: "100%",
      borderRadius: ARTWORK_SIZE / 2,
    },
    artworkFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    underArtworkAyahBadge: {
      marginTop: verticalScale(22),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      backgroundColor: isDark
        ? `${colors.primary}20`
        : `${colors.primary}15`,
      borderColor: `${colors.primary}45`,
      borderWidth: 1.5,
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(5),
      borderRadius: scale(18),
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    underArtworkAyahText: {
      letterSpacing: 0.3,
    },
    bottomSection: {
      width: "100%",
      gap: verticalScale(14),
    },
    trackInfoRow: {
      width: "100%",
    },
    trackTextGroup: {
      gap: verticalScale(4),
    },
    surahTitleLine: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: scale(8),
    },
    surahTitleText: {
      flexShrink: 1,
    },
    arabicBadge: {
      backgroundColor: `${colors.primary}14`,
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: scale(8),
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
    },
    metadataChipsRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: scale(6),
      marginTop: verticalScale(2),
    },
    metadataChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(0, 0, 0, 0.04)",
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(3),
      borderRadius: scale(8),
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
    },
    progressSection: {
      width: "100%",
    },
    slider: {
      width: "100%",
      height: scale(28),
    },
    timeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: scale(2),
      marginTop: verticalScale(2),
    },
    timeText: {
      fontVariant: ["tabular-nums"],
      opacity: 0.75,
    },
    controlsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: scale(4),
    },
    speedPill: {
      paddingHorizontal: scale(10),
      paddingVertical: verticalScale(6),
      borderRadius: scale(16),
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)",
      minWidth: scale(46),
      alignItems: "center",
      justifyContent: "center",
    },
    speedPillActive: {
      backgroundColor: `${colors.primary}20`,
      borderColor: `${colors.primary}50`,
    },
    speedText: {
      color: colors.text,
    },
    speedTextActive: {
      color: colors.primary,
    },
    skipButton: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(23),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(0, 0, 0, 0.04)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
    },
    heroPlayContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    heroPlayHalo: {
      width: scale(78),
      height: scale(78),
      borderRadius: scale(39),
      backgroundColor: `${colors.primary}20`,
      alignItems: "center",
      justifyContent: "center",
    },
    heroPlayButton: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 10,
    },
    repeatButton: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(23),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(0, 0, 0, 0.04)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.05)",
      position: "relative",
    },
    repeatButtonActive: {
      backgroundColor: `${colors.primary}20`,
      borderColor: `${colors.primary}45`,
    },
    repeatDot: {
      width: scale(4),
      height: scale(4),
      borderRadius: scale(2),
      backgroundColor: colors.primary,
      position: "absolute",
      bottom: verticalScale(4),
    },
    upNextContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.06)"
        : "rgba(0, 0, 0, 0.035)",
      borderRadius: scale(16),
      paddingVertical: verticalScale(10),
      paddingHorizontal: scale(14),
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.09)"
        : "rgba(0, 0, 0, 0.05)",
    },
    upNextLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(11),
      flex: 1,
    },
    upNextBadge: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      backgroundColor: `${colors.primary}18`,
      alignItems: "center",
      justifyContent: "center",
    },
    upNextTextContainer: {
      flex: 1,
      gap: verticalScale(1),
    },
    upNextLabel: {
      textTransform: "uppercase",
      opacity: 0.7,
    },
    upNextActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(3),
      paddingHorizontal: scale(11),
      paddingVertical: verticalScale(6),
      borderRadius: scale(12),
      backgroundColor: colors.primary,
    },
    upNextActionText: {
      color: "#FFFFFF",
    },
  });
