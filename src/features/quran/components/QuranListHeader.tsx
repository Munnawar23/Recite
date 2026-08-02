import React from "react";
import { View } from "react-native";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import { LastRead } from "@/store/readingProgressStore";

interface QuranListHeaderProps {
  lastRead: LastRead | null;
  onContinueReading: () => void;
  styles: {
    topSpacer: object;
  };
}

export const QuranListHeader: React.FC<QuranListHeaderProps> = React.memo(
  ({
    lastRead,
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
      </>
    );
  },
);
