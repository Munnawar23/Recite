import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import AudioPlayer from "../components/AudioPlayer";
import AudioPlayerModal from "../components/AudioPlayerModal";
import Header from "../components/Header";
import ScrollTopButton from "../components/ScrollTopButton";
import VerseListContent from "../components/VerseListContent";
import { useQuranDetailScreen } from "../hooks/useQuranDetailScreen";
import { useKeepAwake } from "expo-keep-awake";

export default function QuranDetailScreen() {
  useKeepAwake();

  const {
    chapterId,
    arabicName,
    localizedName,
    localizedTranslation,
    versesCount,
    type,
    colors,
    isDark,
    isOffline,
    topInset,
    verses,
    isLoading,
    isError,
    refetch,
    refreshing,
    onRefresh,
    selectedTransId,
    setTranslationId,
    player,
    status,
    isLoadingAudio,
    playerScrollTranslateY,
    activeVerseKey,
    reciterName,
    audioUrl,
    audioTotalBytes,
    isPlayingLocally,
    listRef,
    scrollHandler,
    animatedHeaderStyle,
    animatedScrollTopStyle,
    showScrollTop,
    scrollToTop,
    handleVersePress,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useQuranDetailScreen();

  const router = useRouter();
  const autoOpenAudioModal = useQuranSettingsStore(
    (state) => state.autoOpenAudioModal,
  );
  const setAutoOpenAudioModal = useQuranSettingsStore(
    (state) => state.setAutoOpenAudioModal,
  );

  const [isAudioModalVisible, setIsAudioModalVisible] = useState(
    () => autoOpenAudioModal,
  );

  const handleOpenAudioModal = useCallback(() => {
    setAutoOpenAudioModal(true);
    setIsAudioModalVisible(true);
  }, [setAutoOpenAudioModal]);

  // When user dismisses via back arrow or hardware back: goes directly to bottom tabs
  const handleDismissToTabs = useCallback(() => {
    // Navigate back directly to tabs without hiding modal first to avoid detail screen flash
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/quran" as any);
    }
  }, [router]);

  // When user taps the top-right cross icon: closes modal and reveals Quran detail screen
  const handleDismissToDetail = useCallback(() => {
    setAutoOpenAudioModal(false);
    setIsAudioModalVisible(false);
  }, [setAutoOpenAudioModal]);

  const S = useMemo(
    () => createStyles(colors.background),
    [colors.background],
  );

  const gradientColors = useMemo(
    () =>
      isDark
        ? [colors.background, colors.background]
        : [colors.primary + "08", colors.background],
    [isDark, colors.background, colors.primary],
  );

  return (
    <View style={S.root}>
      <LinearGradient
        colors={gradientColors as [string, string]}
        style={StyleSheet.absoluteFill}
      />

      <View style={S.mainContainer}>
        <Animated.View style={[S.animatedHeaderContainer, animatedHeaderStyle]}>
          <Header
            chapterId={chapterId}
            arabicName={arabicName}
            localizedName={localizedName}
            versesCount={versesCount}
            type={type}
          />
        </Animated.View>

        <VerseListContent
          isLoading={isLoading}
          isError={isError}
          refetch={refetch}
          listRef={listRef}
          verses={verses}
          activeVerseKey={activeVerseKey}
          selectedTransId={selectedTransId}
          handleVersePress={handleVersePress}
          scrollHandler={scrollHandler}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshing={refreshing}
          onRefresh={onRefresh}
          chapterId={chapterId}
          reciterName={reciterName}
          setTranslationId={setTranslationId}
          audioUrl={audioUrl}
          audioTotalBytes={audioTotalBytes}
          isPlayingLocally={isPlayingLocally}
          arabicName={arabicName}
          localizedName={localizedName}
          localizedTranslation={localizedTranslation}
          versesCount={versesCount}
          chapterType={type}
        />

        {player && status && (
          <AudioPlayer
            player={player}
            status={status}
            isLoadingAudio={isLoadingAudio}
            scrollTranslateY={playerScrollTranslateY}
            onMusicPress={handleOpenAudioModal}
          />
        )}

        <AudioPlayerModal
          visible={isAudioModalVisible}
          onClose={() => setIsAudioModalVisible(false)}
          onDismissToTabs={handleDismissToTabs}
          onDismissToDetail={handleDismissToDetail}
          player={player}
          status={status}
          isLoadingAudio={isLoadingAudio}
          activeVerseKey={activeVerseKey}
          chapterId={chapterId}
          arabicName={arabicName}
          localizedName={localizedName}
          versesCount={versesCount}
          chapterType={type}
          reciterName={reciterName}
          isPlayingLocally={isPlayingLocally}
        />

        <ScrollTopButton
          showScrollTop={showScrollTop}
          animatedScrollTopStyle={animatedScrollTopStyle}
          hasAudioPlayer={!!(player && status)}
          onPress={scrollToTop}
        />
      </View>
    </View>
  );
}

const createStyles = (background: string) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: background,
    },
    mainContainer: {
      flex: 1,
    },
    animatedHeaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
    },
  });
