import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AppText } from "@/components";
import {
  AR_CHAPTER_NAMES,
  CHAPTERS_METADATA,
  getChapter,
  getSurahName,
} from "@/constants";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { Haptics } from "@/lib/haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLanguageStore } from "@/store/languageStore";
import { type ThemeColors } from "@/theme";
import ChapterNumberBadge from "@/components/common/ChapterNumberBadge";
import { usePlayerModal } from "../hooks/usePlayerModal";
import { useSurahCdnAudio } from "../hooks/useSurahCdnAudio";
import { formatTime } from "@/features/quran-detail/hooks/useAudioPlayer";
import type { Chapter } from "@/types";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = Math.min(
  SCREEN_WIDTH - scale(80),
  scale(190),
  SCREEN_HEIGHT * 0.22,
);

interface AudioPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  chapter?: Chapter | null;
  onChapterChange?: (chapter: Chapter) => void;
}

export default function AudioPlayerModal({
  visible,
  onClose,
  chapter,
  onChapterChange,
}: AudioPlayerModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);

  const currentChapterId = chapter?.id ?? 1;

  const chapterMetadata = useMemo(() => {
    return (
      CHAPTERS_METADATA.find((m) => m.id === currentChapterId) ??
      CHAPTERS_METADATA[0]
    );
  }, [currentChapterId]);

  const localizedName = useMemo(() => {
    return chapter?.localizedName || getSurahName(currentChapterId, language);
  }, [chapter?.localizedName, currentChapterId, language]);

  const arabicName = useMemo(() => {
    return (
      chapter?.name ||
      AR_CHAPTER_NAMES[currentChapterId]?.name ||
      "الفاتحة"
    );
  }, [chapter?.name, currentChapterId]);

  const versesCount = chapter?.versesCount ?? chapterMetadata.versesCount;
  const chapterType = chapter?.type ?? chapterMetadata.type;
  const typeTranslationKey =
    chapterType.toLowerCase() === "medinan" ? "quran.medinan" : "quran.meccan";

  // Up Next Queue Calculation
  const nextChapterId = currentChapterId < 114 ? currentChapterId + 1 : 1;
  const nextSurahName = useMemo(() => {
    return getSurahName(nextChapterId, language);
  }, [nextChapterId, language]);

  const {
    closePlayer,
    panGesture,
    animatedSheetStyle,
    animatedBackdropStyle,
    headerTitleAnimatedStyle,
    trackContentAnimatedStyle,
    animateTrackChange,
  } = usePlayerModal({
    visible,
    onClose,
  });

  const handlePlayNext = useCallback(() => {
    if (!onChapterChange) return;
    animateTrackChange(() => {
      const nextChapter = getChapter(nextChapterId, language);
      onChapterChange(nextChapter);
    });
  }, [animateTrackChange, nextChapterId, language, onChapterChange]);

  // Islamic Network CDN Audio integration
  const {
    isLoading,
    isPlaying,
    currentTime,
    duration,
    sliderValue,
    isDragging,
    playbackSpeed,
    isRepeating,
    handlePlayPause,
    handleSkipBack,
    handleSkipForward,
    cycleSpeed,
    toggleRepeat,
    handleSliderValueChange,
    handleSlidingComplete,
  } = useSurahCdnAudio({
    chapterId: currentChapterId,
    enabled: visible,
    localizedName,
    arabicName,
    onPlayNext: handlePlayNext,
  });

  const S = useMemo(
    () => createStyles(colors, insets.top, insets.bottom, isDark),
    [colors, insets.top, insets.bottom, isDark],
  );

  const primaryGradientColors = useMemo(
    () =>
      isDark
        ? (["#0B1B15", "#06120E", "#030806"] as const)
        : (["#E8F5ED", "#F3F8F5", "#FFFFFF"] as const),
    [isDark],
  );

  const depthOverlayColors = useMemo(
    () =>
      isDark
        ? ([
            "rgba(11, 27, 21, 0.45)",
            "rgba(6, 18, 14, 0.75)",
            "rgba(3, 8, 6, 0.95)",
          ] as const)
        : ([
            "rgba(232, 245, 237, 0.5)",
            "rgba(243, 248, 245, 0.8)",
            "rgba(255, 255, 255, 0.96)",
          ] as const),
    [isDark],
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
        {/* Dimmed Backdrop */}
        <TouchableWithoutFeedback onPress={closePlayer}>
          <Animated.View style={[S.backdrop, animatedBackdropStyle]} />
        </TouchableWithoutFeedback>

        {/* Player Sheet */}
        <Animated.View style={[S.sheetContainer, animatedSheetStyle]}>
          {/* Gradients */}
          <LinearGradient
            colors={primaryGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={depthOverlayColors}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Section: Drag Handle & Header */}
          <View style={S.topSection}>
            <GestureDetector gesture={panGesture}>
              <View style={S.dragHandleContainer}>
                <View style={S.dragHandle} />
              </View>
            </GestureDetector>

            <View style={S.headerRow}>
              <TouchableOpacity
                onPress={closePlayer}
                hitSlop={rs.space(12)}
                style={S.headerIconButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={t("common.close", "Close")}
              >
                <Ionicons
                  name="chevron-down"
                  size={scale(24)}
                  color={colors.text}
                />
              </TouchableOpacity>

              <Animated.View style={[S.headerTitleContainer, headerTitleAnimatedStyle]}>
                <ChapterNumberBadge chapterNumber={currentChapterId} size={scale(30)} />
                <AppText
                  variant="bodyLg"
                  family="title"
                  color="text"
                  numberOfLines={1}
                  style={S.headerSurahTitle}
                >
                  {localizedName}
                </AppText>
              </Animated.View>

              <View style={S.headerPlaceholder} />
            </View>
          </View>

          {/* Middle Section: Music Artwork */}
          <GestureDetector gesture={panGesture}>
            <View style={S.middleSection}>
              <Animated.View style={[S.artworkShadow, trackContentAnimatedStyle]}>
                <LinearGradient
                  colors={[colors.primary + "35", colors.card]}
                  style={S.artworkGradient}
                >
                  <Ionicons
                    name="musical-notes"
                    size={scale(64)}
                    color={colors.primary}
                  />
                </LinearGradient>
              </Animated.View>
            </View>
          </GestureDetector>

          {/* Bottom Section: Track Info, Slider & Controls */}
          <View style={S.bottomSection}>
            {/* Title & Metadata */}
            <Animated.View style={[S.trackInfoRow, trackContentAnimatedStyle]}>
              <View style={S.trackTextGroup}>
                <View style={S.surahTitleLine}>
                  <AppText
                    variant="heading"
                    family="heading"
                    color="text"
                    numberOfLines={1}
                    style={S.surahTitleText}
                  >
                    {localizedName}
                  </AppText>
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
                </View>

                <View style={S.metadataChipsRow}>
                  <View style={S.metadataChip}>
                    <Ionicons
                      name="book-outline"
                      size={scale(10)}
                      color={colors.subtext}
                    />
                    <AppText
                      variant="body"
                      family="title"
                      color="subtext"
                    >
                      {t("quran.versesCount", { count: versesCount })}
                    </AppText>
                  </View>

                  <View style={S.metadataChip}>
                    <Ionicons
                      name="location-outline"
                      size={scale(10)}
                      color={colors.subtext}
                    />
                    <AppText
                      variant="bodySm"
                      family="title"
                      color="subtext"
                      numberOfLines={1}
                    >
                      {t(typeTranslationKey)}
                    </AppText>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Slider & Time */}
            <View style={S.progressSection}>
              <Slider
                style={S.slider}
                minimumValue={0}
                maximumValue={duration > 0 ? duration : 1}
                value={Math.min(
                  Math.max(0, sliderValue),
                  duration > 0 ? duration : 1,
                )}
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
                  {formatTime(sliderValue)}
                </AppText>
                <AppText variant="caption" color="subtext" style={S.timeText}>
                  {formatTime(duration)}
                </AppText>
              </View>
            </View>

            {/* Controls Row */}
            <View style={S.controlsRow}>
              {/* Speed Button */}
              <TouchableOpacity
                onPress={cycleSpeed}
                style={S.speedPill}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Speed ${playbackSpeed % 1 === 0 ? `${playbackSpeed}.0` : playbackSpeed}x`}
              >
                <AppText variant="caption" family="title" style={S.speedText}>
                  {`${playbackSpeed % 1 === 0 ? `${playbackSpeed}.0` : playbackSpeed}x`}
                </AppText>
              </TouchableOpacity>

              {/* Skip Back 10s */}
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

              {/* Play / Pause Button */}
              <TouchableOpacity
                onPress={handlePlayPause}
                style={S.heroPlayContainer}
                activeOpacity={0.88}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={
                  isLoading ? "Loading" : isPlaying ? "Pause" : "Play"
                }
              >
                <View style={S.heroPlayHalo}>
                  <View style={S.heroPlayButton}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={scale(30)}
                        color="#FFFFFF"
                        style={!isPlaying ? { marginLeft: scale(3) } : undefined}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Skip Forward 10s */}
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

              {/* Repeat Toggle */}
              <TouchableOpacity
                onPress={toggleRepeat}
                hitSlop={rs.space(10)}
                style={S.repeatButton}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Toggle repeat"
              >
                <Ionicons
                  name="repeat"
                  size={scale(22)}
                  color={isRepeating ? colors.primary : colors.subtext}
                />
              </TouchableOpacity>
            </View>

            {/* Up Next Card */}
            <TouchableOpacity
              style={S.upNextContainer}
              activeOpacity={0.8}
              onPress={handlePlayNext}
              accessibilityRole="button"
              accessibilityLabel={`${t("quran.upNextInQueue", "Up Next in Queue")}: ${nextSurahName}`}
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
                    {t("quran.upNextInQueue", "UP NEXT IN QUEUE")}
                  </AppText>
                  <AppText
                    variant="body"
                    family="title"
                    color="text"
                    numberOfLines={1}
                  >
                    {`${nextChapterId}. ${nextSurahName}`}
                  </AppText>
                </View>
              </View>

              <View style={S.upNextActionBtn}>
                <AppText
                  variant="caption"
                  family="title"
                  style={S.upNextActionText}
                >
                  {t("quran.playNext", "Play Next")}
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
    headerPlaceholder: {
      width: scale(38),
      height: scale(38),
    },
    headerTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      flex: 1,
      paddingHorizontal: scale(8),
    },
    headerSurahTitle: {
      textAlign: "center",
    },
    middleSection: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingVertical: verticalScale(8),
      position: "relative",
    },
    artworkShadow: {
      width: ARTWORK_SIZE,
      height: ARTWORK_SIZE,
      borderRadius: ARTWORK_SIZE / 2,
      backgroundColor: colors.card,
      position: "relative",
      overflow: "hidden",
      borderWidth: scale(3),
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.12)"
        : colors.primary + "30",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    artworkGradient: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
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
    speedText: {
      color: colors.text,
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
