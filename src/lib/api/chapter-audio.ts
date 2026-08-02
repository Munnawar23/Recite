import { quranApiClient } from "./client";

export const getChapterAudio = async (
  chapterId: number,
  reciterId: number = 7,
) => {
  const { data } = await quranApiClient.get(
    `/chapter_recitations/${reciterId}/${chapterId}?segments=true`,
  );
  return data.audio_file;
};
