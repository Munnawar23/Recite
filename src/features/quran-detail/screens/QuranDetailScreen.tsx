import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { verticalScale } from "react-native-size-matters";

import AudioPlayer from "../components/AudioPlayer";
import Header from "../components/Header";
import ScrollTopButton from "../components/ScrollTopButton";
import VerseListContent from "../components/VerseListContent";
import { useQuranDetailScreen } from "../hooks/useQuranDetailScreen";

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
    () => createStyles(colors.background, topInset, isOffline),
    [colors.background, topInset, isOffline],
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

const createStyles = (
  background: string,
  topInset: number,
  isOffline: boolean,
) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: background,
    },
    mainContainer: {
      flex: 1,
      paddingTop: isOffline ? verticalScale(4) : topInset,
    },
    animatedHeaderContainer: {
      position: "absolute",
      top: isOffline ? verticalScale(4) : topInset,
      left: 0,
      right: 0,
      zIndex: 20,
    },
  });
