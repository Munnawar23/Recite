import { CommonModal } from "@/components";
import { Haptics } from "@/lib/haptics";
import React from "react";
import { View } from "react-native";
import { verticalScale } from "react-native-size-matters";
import BismillahBanner from "./BismillahBanner";
import DownloadCard from "./DownloadCard";

const TRANSLATION_OPTIONS = [
  { label: "Arabic Only", value: "0" },
  { label: "English (Saheeh)", value: "20" },
  { label: "Urdu (Maududi)", value: "97" },
  { label: "Hindi (Azizul Haque)", value: "122" },
  { label: "Indonesian (Ministry)", value: "33" },
  { label: "Bengali (Taisirul)", value: "161" },
];

interface VerseListHeaderProps {
  chapterId: number;
  selectedTransId: string;
  reciterName: string;
  setTranslationId: (id: string) => void;
  audioUrl?: string | null;
  audioTotalBytes?: number | null;
  isPlayingLocally?: boolean;
  // Chapter display info — needed so DownloadCard can persist it for offline library
  arabicName?: string;
  englishName?: string;
  englishTranslation?: string;
  versesCount?: string;
  chapterType?: string;
}

function VerseListHeader({
  chapterId,
  selectedTransId,
  reciterName,
  setTranslationId,
  audioUrl,
  audioTotalBytes,
  isPlayingLocally,
  arabicName,
  englishName,
  englishTranslation,
  versesCount,
  chapterType,
}: VerseListHeaderProps) {
  return (
    <View>
      <View style={{ marginTop: verticalScale(4) }}>
        <CommonModal
          data={TRANSLATION_OPTIONS}
          value={selectedTransId}
          onChange={(item) => {
            Haptics.medium();
            setTranslationId(item.value);
          }}
          placeholder="Select Translation"
        />
      </View>
      <DownloadCard
        chapterId={chapterId}
        reciterName={reciterName}
        selectedTransId={selectedTransId}
        audioUrl={audioUrl}
        audioTotalBytes={audioTotalBytes}
        isPlayingLocally={isPlayingLocally}
        arabicName={arabicName}
        englishName={englishName}
        englishTranslation={englishTranslation}
        versesCount={versesCount}
        chapterType={chapterType}
      />
      <BismillahBanner chapterId={chapterId} />
      <View style={{ height: verticalScale(8) }} />
    </View>
  );
}

export default React.memo(VerseListHeader);
