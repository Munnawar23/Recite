import React from "react";
import { ActivityIndicator, View } from "react-native";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import { LastRead } from "@/store/readingProgressStore";

interface QuranListHeaderProps {
  lastRead: LastRead | null;
  isLoading: boolean;
  refreshing: boolean;
  primaryColor: string;
  onContinueReading: () => void;
  styles: {
    topSpacer: object;
    loadingContainer: object;
  };
}

export const QuranListHeader: React.FC<QuranListHeaderProps> = React.memo(
  ({
    lastRead,
    isLoading,
    refreshing,
    primaryColor,
    onContinueReading,
    styles,
  }) => {
    return (
      <>
        {lastRead ? (
          <ContinueReadingCard
            surahName={lastRead.surahName}
            verseNumber={lastRead.verseNumber}
            onPress={onContinueReading}
          />
        ) : (
          <View style={styles.topSpacer} />
        )}

        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        )}
      </>
    );
  },
);
