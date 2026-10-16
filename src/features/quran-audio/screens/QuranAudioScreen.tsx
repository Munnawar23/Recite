import { FlashList, FlashListRef, ListRenderItemInfo } from "@shopify/flash-list";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, RefreshControlProps, StyleSheet, View } from "react-native";

import { Background, ScreenHeader } from "@/components";
import { getChapters } from "@/constants";
import AudioPlayerModal from "@/features/quran-audio/components/AudioPlayerModal";
import QuranListenCard from "@/features/quran-audio/components/QuranListenCard";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLanguageStore } from "@/store/languageStore";
import { type ThemeSpacing } from "@/theme";
import { Chapter } from "@/types";

export default function QuranAudioScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const language = useLanguageStore((state) => state.language);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);

  // Static instant local chapters data mapped directly to active language
  const chapters = useMemo(() => getChapters(language), [language]);

  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlashListRef<Chapter>>(null);

  const styles = useMemo(
    () => createStyles(spacing),
    [spacing],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 300);
  }, []);

  const handleListenCardPress = useCallback((item: Chapter) => {
    setSelectedChapter(item);
    setIsPlayerModalVisible(true);
  }, []);

  const handleClosePlayerModal = useCallback(() => {
    setIsPlayerModalVisible(false);
  }, []);

  const keyExtractor = useCallback(
    (item: Chapter) => `audio-chapter-${item.id}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Chapter>) => (
      <QuranListenCard item={item} onPress={handleListenCardPress} />
    ),
    [handleListenCardPress],
  );

  const refreshControl = useMemo(
    (): React.ReactElement<RefreshControlProps> => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
      />
    ),
    [refreshing, onRefresh, colors.primary],
  );

  return (
    <View style={styles.container}>
      <Background />
      <ScreenHeader
        title={t("home.explore.quranAudio.title", "Quran Audio")}
        subtitle={t("home.explore.quranAudio.subtitle", "Listen to the Holy Quran")}
      />
      <View style={styles.listWrapper}>
        <FlashList<Chapter>
          ref={listRef}
          data={chapters}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          drawDistance={rs.space(500)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={refreshControl}
        />
      </View>
      <AudioPlayerModal
        visible={isPlayerModalVisible}
        onClose={handleClosePlayerModal}
        chapter={selectedChapter}
        onChapterChange={setSelectedChapter}
      />
    </View>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    listWrapper: {
      flex: 1,
      marginTop: spacing.vXs,
    },
    listContent: {
      flexGrow: 1,
      paddingTop: spacing.vXs,
      paddingBottom: spacing.vLg,
    },
  });
