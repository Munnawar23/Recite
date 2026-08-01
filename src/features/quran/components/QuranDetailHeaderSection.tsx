import CommonModal from "@/components/ui/CommonModal";
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

interface QuranDetailHeaderSectionProps {
  chapterId: number;
  selectedTransId: string;
  reciterName: string;
  onTranslationChange: (value: string) => void;
}

export default function QuranDetailHeaderSection({
  chapterId,
  selectedTransId,
  reciterName,
  onTranslationChange,
}: QuranDetailHeaderSectionProps) {
  return (
    <View>
      <View style={{ marginTop: verticalScale(4) }}>
        <CommonModal
          data={TRANSLATION_OPTIONS}
          value={selectedTransId}
          onChange={(item) => {
            Haptics.medium();
            onTranslationChange(item.value);
          }}
          placeholder="Select Translation"
        />
      </View>
      <DownloadCard
        chapterId={chapterId}
        reciterName={reciterName}
        selectedTransId={selectedTransId}
      />
      <BismillahBanner chapterId={chapterId} />
      <View style={{ height: verticalScale(8) }} />
    </View>
  );
}
