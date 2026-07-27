import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";

import SafeArea from "@/components/layout/SafeArea";
import Header from "@/components/ui/Header";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import QuranCard from "@/features/quran/components/QuranCard";
import SearchBar from "@/features/quran/components/SearchBar";
import { useAppTheme } from "@/hooks/useAppTheme";
import { ThemeSpacing } from "@/theme/spacing";
import { Chapter } from "@/types/quran";

const MOCK_CHAPTERS: Chapter[] = [
  {
    id: 1,
    name: "الفاتحة",
    englishName: "Al-Fatihah",
    englishTranslation: "The Opening",
    versesCount: 7,
    type: "meccan",
  },
  {
    id: 2,
    name: "البقرة",
    englishName: "Al-Baqarah",
    englishTranslation: "The Cow",
    versesCount: 286,
    type: "medinan",
  },
  {
    id: 3,
    name: "آل عمران",
    englishName: "Ali 'Imran",
    englishTranslation: "Family of Imran",
    versesCount: 200,
    type: "medinan",
  },
  {
    id: 4,
    name: "النساء",
    englishName: "An-Nisa",
    englishTranslation: "The Women",
    versesCount: 176,
    type: "medinan",
  },
  {
    id: 5,
    name: "المائدة",
    englishName: "Al-Ma'idah",
    englishTranslation: "The Table Spread",
    versesCount: 120,
    type: "medinan",
  },
  {
    id: 6,
    name: "الأنعام",
    englishName: "Al-An'am",
    englishTranslation: "The Cattle",
    versesCount: 165,
    type: "meccan",
  },
];

export default function QuranScreen() {
  const { t } = useTranslation();
  const { spacing } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const styles = createStyles(spacing);

  const filteredChapters = MOCK_CHAPTERS.filter(
    (item) =>
      item.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.englishTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.includes(searchQuery),
  );

  return (
    <SafeArea>
      <FlatList
        data={filteredChapters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <QuranCard item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Header
              title={t("quran.title")}
              subtitle={t("quran.subtitle")}
            />
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
              placeholder={t("quran.searchPlaceholder")}
            />
            <ContinueReadingCard
              surahName="Al-Fatihah"
              verseNumber={1}
            />
          </>
        }
        ListFooterComponent={<View style={styles.bottomSpacer} />}
      />
    </SafeArea>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: spacing.vLg,
    },
    bottomSpacer: {
      height: spacing.vXxl,
    },
  });
