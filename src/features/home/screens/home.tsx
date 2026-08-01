import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import EmptyState from "@/components/layout/EmptyState";
import Header from "@/components/layout/Header";
import SectionTitle from "@/components/ui/SectionTitle";
import PrayerTimes from "@/features/home/components/PrayerTimes";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocation } from "@/hooks/useLocation";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import { ThemeSpacing } from "@/theme/spacing";
import DailyVerse from "../components/DailyVerse";
import HijriCard from "../components/HijriCard";

const animation = (delay: number) =>
  FadeInDown.duration(350).delay(Math.min(delay * 0.3, 120));

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { cityName } = useLocation();
  const queryClient = useQueryClient();
  const { lastRead } = useReadingProgressStore();
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(spacing);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-location"] }),
        queryClient.invalidateQueries({ queryKey: ["hijri-date"] }),
        queryClient.invalidateQueries({ queryKey: ["prayer-times"] }),
        queryClient.invalidateQueries({ queryKey: ["daily-verse"] }),
      ]);
    } catch (error) {
      console.warn("Pull-to-refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Greeting */}
        <Animated.View entering={animation(100)}>
          <Header
            title={t("home.greeting.title", "السَّلامُ عَلَيْكُم")}
            subtitle={t(
              "home.greeting.subtitle",
              "May your day be full of blessings",
            )}
          />
        </Animated.View>

        {/* Hijri Date */}
        <Animated.View entering={animation(200)}>
          <HijriCard />
        </Animated.View>

        {/* Prayer Times */}
        <Animated.View entering={animation(300)}>
          <SectionTitle
            label={t("home.sectionTitles.prayerTimes", "Prayer Times")}
            icon="time-outline"
            rightText={cityName ? `📍 ${cityName}` : undefined}
          />
          <PrayerTimes />
        </Animated.View>

        {/* Daily Verse */}
        <Animated.View entering={animation(400)}>
          <SectionTitle
            label={t("home.sectionTitles.dailyVerse", "Daily Verse")}
            icon="star-outline"
          />
          <DailyVerse />
        </Animated.View>

        {/* Continue Reading */}
        <Animated.View entering={animation(500)}>
          <SectionTitle
            label={t("home.sectionTitles.continueReading", "Continue Reading")}
            icon="book-outline"
          />

          {lastRead ? (
            <ContinueReadingCard
              surahName={lastRead.surahName}
              verseNumber={lastRead.verseNumber}
              onPress={() =>
                router.push({
                  pathname: "/surah/[id]",
                  params: {
                    id: String(lastRead.surahNumber),
                    englishName: lastRead.surahName,
                    arabicName: lastRead.arabicName,
                    versesCount: lastRead.versesCount,
                    type: lastRead.type,
                    initialVerse: String(lastRead.verseNumber),
                  },
                })
              }
            />
          ) : (
            <EmptyState
              icon="book-outline"
              title={t("home.continueReadingEmpty.title", "Start your journey")}
              subtitle={t(
                "home.continueReadingEmpty.subtitle",
                "Open the Quran and your reading progress will appear here.",
              )}
              buttonLabel={t(
                "home.continueReadingEmpty.buttonLabel",
                "Open Quran",
              )}
              buttonIcon="book"
              onPress={() => router.push("/(tabs)/quran")}
            />
          )}
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.vLg,
    },
    bottomSpacer: {
      height: spacing.vXxl,
    },
  });
