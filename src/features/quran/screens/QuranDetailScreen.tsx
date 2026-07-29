import React, { useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FlashList } from "@shopify/flash-list";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useActiveQuranDetail } from "@/features/quran/hooks/useQuranDetail";
import { scale, verticalScale } from "react-native-size-matters";
import { Haptics } from "@/lib/haptics";
import type { SurahVerse } from "@/types/quran";
import { useDownloadsStore } from "@/store/downloadsStore";

// Sub-components
import DetailHeader from "../components/DetailHeader";
import BismillahBanner from "../components/BismillahBanner";
import VerseRow from "../components/VerseRow";
import AudioPlayerControls from "../components/AudioPlayerControls";
import { useQuranAudio, RECITER_OPTIONS } from "../hooks/useQuranAudio";
import DownloadCard from "../components/DownloadCard";

const TRANSLATION_OPTIONS = [
  { label: "Arabic Only", value: "0" },
  { label: "English (Saheeh)", value: "20" },
  { label: "Urdu (Maududi)", value: "97" },
  { label: "Hindi (Azizul Haque)", value: "122" },
  { label: "Indonesian (Ministry)", value: "33" },
  { label: "Bengali (Taisirul)", value: "161" },
];

export default function QuranDetailScreen() {
  const { id, arabicName, englishName, versesCount, type } = useLocalSearchParams<{
    id: string;
    arabicName: string;
    englishName: string;
    versesCount: string;
    type: string;
    initialVerse?: string;
  }>();

  const { colors, fontFamily, fontSize, activeScheme } = useAppTheme();
  const isDark = activeScheme === "dark";
  const chapterId = parseInt(id ?? "1", 10);

  const [selectedTransId, setSelectedTransId] = useState<string>("20");

  const { downloadedChapters } = useDownloadsStore();
  const localChapter = downloadedChapters[chapterId];
  const isDownloaded = !!localChapter;

  const queryTransId = selectedTransId === "0" ? 20 : parseInt(selectedTransId, 10);
  const { data: apiVerses = [], isLoading: isApiLoading, isError: isApiError, refetch } = useActiveQuranDetail(
    "chapters",
    chapterId,
    queryTransId
  );

  const verses = isDownloaded
    ? (localChapter.versesByTranslation?.[queryTransId] || localChapter.verses)
    : apiVerses;
  const isLoading = isDownloaded ? false : isApiLoading;
  const isError = isDownloaded ? false : isApiError;

  // Audio Playback integration
  const {
    player,
    status,
    activeVerseKey,
    isLoadingAudio,
    reciterId,
    setReciterId,
    timestamps = [],
  } = useQuranAudio(chapterId, true);

  const activeReciter = RECITER_OPTIONS.find((r) => r.id === reciterId);
  const reciterName = activeReciter ? activeReciter.label : "Mishary Rashid Alafasy";

  const listRef = useRef<any>(null);

  const S = createStyles(colors, fontFamily, fontSize, isDark);

  const handleVersePress = useCallback((verseKey: string) => {
    const matchedTimestamp = timestamps.find((ts) => ts.verse_key === verseKey);
    if (matchedTimestamp && player) {
      player.seekTo((matchedTimestamp.timestamp_from + 150) / 1000);
    }
  }, [timestamps, player]);

  const renderVerse = useCallback(({ item }: { item: SurahVerse }) => {
    const isActive = item.verseKey === activeVerseKey;
    return (
      <VerseRow
        item={item}
        selectedTransId={selectedTransId}
        isActive={isActive}
        onPress={() => handleVersePress(item.verseKey)}
      />
    );
  }, [selectedTransId, activeVerseKey, handleVersePress]);

  // Scroll to playing verse
  useEffect(() => {
    if (activeVerseKey && verses.length > 0) {
      const index = verses.findIndex((v) => v.verseKey === activeVerseKey);
      if (index !== -1) {
        listRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3,
        });
      }
    }
  }, [activeVerseKey, verses]);

  const renderHeader = () => (
    <View>
      <BismillahBanner chapterId={chapterId} />
      <View style={{ height: verticalScale(8) }} />
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={S.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={S.loadingText}>Loading Surah...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={S.centerContainer}>
          <Ionicons name="cloud-offline-outline" size={scale(52)} color={colors.subtext} />
          <Text style={S.errorTitle}>Failed to Load</Text>
          <Text style={S.errorSubtitle}>Check your internet connection and try again.</Text>
          <TouchableOpacity style={S.retryButton} onPress={() => refetch()}>
            <Text style={S.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const FlashListCast = FlashList as any;

    return (
      <FlashListCast
        ref={listRef}
        data={verses}
        renderItem={renderVerse}
        ListHeaderComponent={renderHeader}
        keyExtractor={(item: SurahVerse) => String(item.id)}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={220}
        contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: verticalScale(180) }}
      />
    );
  };

  return (
    <View style={S.root}>
      <LinearGradient
        colors={isDark
          ? [colors.background, colors.background]
          : [colors.primary + "08", colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <DetailHeader
          chapterId={chapterId}
          arabicName={arabicName}
          englishName={englishName}
          versesCount={versesCount}
          type={type}
          translationOptions={TRANSLATION_OPTIONS}
          selectedTransId={selectedTransId}
          onTranslationChange={(id) => {
            Haptics.medium();
            setSelectedTransId(id);
          }}
        />

        <DownloadCard
          chapterId={chapterId}
          reciterName={reciterName}
          selectedTransId={selectedTransId}
        />

        {renderContent()}

        {player && status && (
          <AudioPlayerControls
            player={player}
            status={status}
            isLoadingAudio={isLoadingAudio}
            reciterId={reciterId}
            onReciterChange={setReciterId}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: any, fontFamily: any, fontSize: any, isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: verticalScale(12),
      paddingHorizontal: scale(32),
    },
    loadingText: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
    },
    errorTitle: {
      color: colors.text,
      fontFamily: fontFamily.title,
      fontSize: fontSize.title,
    },
    errorSubtitle: {
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
      textAlign: "center",
      lineHeight: fontSize.body * 1.6,
    },
    retryButton: {
      marginTop: verticalScale(8),
      paddingHorizontal: scale(28),
      paddingVertical: verticalScale(10),
      backgroundColor: colors.primary,
      borderRadius: scale(20),
    },
    retryButtonText: {
      color: colors.card,
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
    },
  });
