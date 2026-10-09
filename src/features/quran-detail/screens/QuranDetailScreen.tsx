import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import AudioPlayer from "../components/AudioPlayer";
import Header from "../components/Header";
import ScrollTopButton from "../components/ScrollTopButton";
import VerseListContent from "../components/VerseListContent";
import { useQuranDetailScreen } from "../hooks/useQuranDetailScreen";
import { useKeepAwake } from "expo-keep-awake";

function KeepAwakeWhilePlaying() {
  useKeepAwake();
  return null;
}

export default function QuranDetailScreen() {
  const {
    chapterId,
    arabicName,
    englishName,
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
        {status?.playing ? <KeepAwakeWhilePlaying /> : null}
        <Animated.View style={[S.animatedHeaderContainer, animatedHeaderStyle]}>
          <Header
            chapterId={chapterId}
            arabicName={arabicName}
            englishName={englishName}
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
          englishName={englishName}
          versesCount={versesCount}
          chapterType={type}
        />

        {player && status && (
          <AudioPlayer
            player={player}
            status={status}
            isLoadingAudio={isLoadingAudio}
            scrollTranslateY={playerScrollTranslateY}
          />
        )}

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
