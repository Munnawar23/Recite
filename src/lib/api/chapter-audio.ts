import { DEFAULT_RECITER_ID } from "@/constants";
import { quranApiClient } from "./client";

export const getChapterAudio = async (
  chapterId: number,
  reciterId: number = DEFAULT_RECITER_ID,
) => {
  const { data } = await quranApiClient.get(
    `/chapter_recitations/${reciterId}/${chapterId}?segments=true`,
  );
  return data.audio_file;
};
