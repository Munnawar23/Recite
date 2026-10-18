import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Slider from "@react-native-community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import { AppText, AppToast, CommonModal } from "@/components";
import { rs, scale, verticalScale } from "@/helpers/responsiveHelper";
import { Haptics } from "@/lib/haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeColors } from "@/theme";
import ChapterNumberBadge from "@/components/ui/ChapterNumberBadge";
import { usePlayerModal } from "../hooks/usePlayerModal";
import { formatTime } from "@/features/quran-detail/hooks/useAudioPlayer";
import type { Chapter } from "@/types";

function withAlpha(color: string, alphaHex: string): string {
  if (!color) return color;
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    } else if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    if (hex.length === 6) {
      return `#${hex}${alphaHex}`;
    }
    return color;
  }
  return color;
}

interface AudioPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  chapter?: Chapter | null;
  onChapterChange?: (chapter: Chapter) => void;
  audioLanguage?: "en" | "ar" | string;
}

export default function AudioPlayerModal({
  visible,
  onClose,
  chapter,
  onChapterChange,
  audioLanguage,
}: AudioPlayerModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const { t } = useTranslation();

  const {
    // Modal animations & actions
    closePlayer,
    panGesture,
    animatedSheetStyle,
    animatedBackdropStyle,
    headerTitleAnimatedStyle,
    trackContentAnimatedStyle,

    // Chapter metadata
    currentChapterId,
    localizedName,
    arabicName,
    versesCount,
    typeTranslationKey,
    nextChapterId,
    nextSurahName,
    handlePlayNext,

    // Reciter state & actions
    isEnglish,
    selectedEditionName,
    activeReciterId,
    currentReciter,
    reciterDropdownItems,
    isReciterModalVisible,
    setIsReciterModalVisible,
    avatarError,
    setAvatarError,
    handleSelectReciter,

    // Audio controls
    audio: {
      isLoading,
      isAudioError,
      retryAudioLoad,
      isPlaying,
      duration,
      sliderValue,
      playbackSpeed,
      isRepeating,
      reciterName,
      handlePlayPause,
      handleSkipBack,
      handleSkipForward,
      cycleSpeed,
      toggleRepeat,
      handleSliderValueChange,
      handleSlidingComplete,
    },
  } = usePlayerModal({
    visible,
    onClose,
    chapter,
    onChapterChange,
    audioLanguage,
  });

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const artworkSize = useMemo(
    () =>
      Math.min(
        windowWidth - scale(50),
        scale(250),
        windowHeight * 0.29,
      ),
    [windowWidth, windowHeight],
  );

  useEffect(() => {
    if (visible && isAudioError) {
      Toast.show({
        type: "error",
        text1: t("common.noConnectionTitle", "Connection Error"),
        text2: t("common.noConnectionSubtitle", "Could not load data. Check your internet connection."),
        onPress: retryAudioLoad,
      });
    }
  }, [visible, isAudioError, retryAudioLoad, t]);

  const safeDuration =
    Number.isFinite(duration) && duration > 0 ? duration : 1;
  const safeValue = Number.isFinite(sliderValue)
    ? Math.min(Math.max(0, sliderValue), safeDuration)
    : 0;
  const rawDuration = Number.isFinite(duration) ? duration : 0;

  const handleClose = useCallback(() => {
    Haptics.light();
    closePlayer();
  }, [closePlayer]);

  const handleRequestClose = useCallback(() => {
    if (isReciterModalVisible) {
      setIsReciterModalVisible(false);
    } else {
      handleClose();
    }
  }, [isReciterModalVisible, handleClose]);

  const S = useMemo(
    () =>
      createStyles(
        colors,
        insets.top,
        insets.bottom,
        isDark,
        artworkSize,
      ),
    [colors, insets.top, insets.bottom, isDark, artworkSize],
  );

  const primaryGradientColors = useMemo(
    () =>
      isDark
        ? (["#0B1B15", "#06120E", "#030806"] as const)
        : (["#DCEAE1", "#E6EFEB", "#DDE8E2"] as const),
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
            "rgba(205, 224, 213, 0.45)",
            "rgba(224, 235, 229, 0.7)",
            "rgba(235, 242, 238, 0.95)",
          ] as const),
    [isDark],
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <GestureHandlerRootView style={S.rootContainer}>
        {/* Dimmed Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
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
                onPress={handleClose}
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

              <TouchableOpacity
                onPress={() => {
                  Haptics.light();
                  setIsReciterModalVisible(true);
                }}
                style={S.reciterButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={t("onboarding.preferences.title", "Choose Quran Reciter")}
              >
                {currentReciter?.avatar ? (
                  <Image
                    source={currentReciter.avatar}
                    style={S.reciterAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons
                    name="mic-outline"
                    size={scale(18)}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Middle Section: Music Artwork */}
          <GestureDetector gesture={panGesture}>
            <View style={S.middleSection}>
              <Animated.View style={[S.artworkShadow, trackContentAnimatedStyle]}>
                <View style={S.artworkHalo} />
                <View style={S.artworkInner}>
                  {currentReciter?.avatar && !avatarError ? (
                    <Image
                      source={currentReciter.avatar}
                      style={S.artworkImage}
                      contentFit="cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <LinearGradient
                      colors={[withAlpha(colors.primary, "35"), colors.card]}
                      style={S.artworkGradient}
                    >
                      <Ionicons
                        name="musical-notes"
                        size={scale(64)}
                        color={colors.primary}
                      />
                    </LinearGradient>
                  )}
                </View>
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

                  {reciterName ? (
                    <View style={S.metadataChip}>
                      <Ionicons
                        name="mic-outline"
                        size={scale(10)}
                        color={colors.subtext}
                      />
                      <AppText
                        variant="body"
                        family="title"
                        color="subtext"
                        numberOfLines={1}
                      >
                        {reciterName}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>
            </Animated.View>

            {/* Slider & Time */}
            <View style={S.progressSection}>
              <Slider
                style={S.slider}
                minimumValue={0}
                maximumValue={safeDuration}
                value={safeValue}
                disabled={isLoading}
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
                  {formatTime(safeValue)}
                </AppText>
                <AppText variant="caption" color="subtext" style={S.timeText}>
                  {formatTime(rawDuration)}
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
                style={[S.skipButton, isLoading && S.controlDisabled]}
                disabled={isLoading}
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

              {/* Play / Pause / Retry Button */}
              <TouchableOpacity
                onPress={isAudioError ? retryAudioLoad : handlePlayPause}
                style={S.heroPlayContainer}
                activeOpacity={0.88}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={
                  isAudioError ? "Retry" : isLoading ? "Loading" : isPlaying ? "Pause" : "Play"
                }
              >
                <View style={S.heroPlayHalo}>
                  <View style={S.heroPlayButton}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : isAudioError ? (
                      <Ionicons
                        name="reload"
                        size={scale(28)}
                        color="#FFFFFF"
                      />
                    ) : (
                      <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={scale(30)}
                        color="#FFFFFF"
                        style={!isPlaying ? S.playIconOffset : undefined}
                      />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Skip Forward 10s */}
              <TouchableOpacity
                onPress={handleSkipForward}
                hitSlop={rs.space(10)}
                style={[S.skipButton, isLoading && S.controlDisabled]}
                disabled={isLoading}
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
            {nextSurahName ? (
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
            ) : null}
          </View>
        </Animated.View>

        <CommonModal
          visible={isReciterModalVisible}
          onClose={() => setIsReciterModalVisible(false)}
          title={t("onboarding.preferences.title", "Choose Quran Reciter")}
          icon="mic-outline"
          data={reciterDropdownItems}
          value={isEnglish ? selectedEditionName : String(activeReciterId)}
          onChange={(item) => handleSelectReciter(item.value)}
        />

        <AppToast />
      </GestureHandlerRootView>
    </Modal>
  );
}

const createStyles = (
  colors: ThemeColors,
  topInset: number,
  bottomInset: number,
  isDark: boolean,
  artworkSize: number,
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
      backgroundColor: isDark ? "#070E0F" : "#E2ECE6",
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
    reciterButton: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      borderWidth: 1.5,
      borderColor: colors.primary,
      overflow: "hidden",
      backgroundColor: withAlpha(colors.primary, "18"),
      alignItems: "center",
      justifyContent: "center",
    },
    reciterAvatar: {
      width: "100%",
      height: "100%",
      borderRadius: scale(19),
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
      width: artworkSize,
      height: artworkSize,
      borderRadius: artworkSize / 2,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: isDark ? 0.75 : 0.5,
      shadowRadius: scale(18),
      elevation: 14,
    },
    artworkHalo: {
      position: "absolute",
      width: artworkSize + scale(14),
      height: artworkSize + scale(14),
      borderRadius: (artworkSize + scale(14)) / 2,
      backgroundColor: withAlpha(colors.primary, isDark ? "25" : "18"),
      borderWidth: 1,
      borderColor: withAlpha(colors.primary, isDark ? "40" : "30"),
    },
    artworkInner: {
      width: artworkSize,
      height: artworkSize,
      borderRadius: artworkSize / 2,
      backgroundColor: colors.card,
      borderWidth: scale(3.5),
      borderColor: colors.primary,
      overflow: "hidden",
      position: "relative",
    },
    artworkImage: {
      width: "100%",
      height: "100%",
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
      backgroundColor: withAlpha(colors.primary, "14"),
      paddingHorizontal: scale(8),
      paddingVertical: verticalScale(2),
      borderRadius: scale(8),
      borderWidth: 1,
      borderColor: withAlpha(colors.primary, "30"),
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
    controlDisabled: {
      opacity: 0.45,
    },
    playIconOffset: {
      marginLeft: scale(3),
    },
    heroPlayContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    heroPlayHalo: {
      width: scale(78),
      height: scale(78),
      borderRadius: scale(39),
      backgroundColor: withAlpha(colors.primary, "20"),
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
      backgroundColor: withAlpha(colors.primary, "18"),
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
