import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { EmptyState, Header, SectionTitle } from "@/components";
import { getSurahName } from "@/constants";
import PrayerTimes from "@/features/home/components/PrayerTimes";
import ContinueReadingCard from "@/features/quran/components/ContinueReadingCard";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLocation } from "@/hooks/useLocation";
import { useLanguageStore } from "@/store/languageStore";
import { useReadingProgressStore } from "@/store/readingProgressStore";
import { type ThemeSpacing } from "@/theme";
import DailyVerse from "../components/DailyVerse";
import HijriCard from "../components/HijriCard";
import ExploreCard from "../components/ExploreCard";

const animation = (delay: number) =>
  FadeInDown.duration(350).delay(Math.min(delay * 0.3, 120));

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const { cityName, isLoading, permissionStatus } = useLocation();

  const getRightLocationText = () => {
    if (permissionStatus === "granted" && cityName) {
      return `📍 ${cityName}`;
    }
    if (permissionStatus === "denied" || permissionStatus === "undetermined") {
      return "📍 Mecca";
    }
    return undefined;
  };
  const queryClient = useQueryClient();
  const { lastRead } = useReadingProgressStore();
  const language = useLanguageStore((state) => state.language);
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(spacing), [spacing]);

  const lastReadLocalizedName = useMemo(() => {
    return lastRead ? getSurahName(lastRead.surahNumber, language) : "";
  }, [lastRead, language]);

  const handleContinueReading = useCallback(() => {
    if (!lastRead) return;
    router.push({
      pathname: "/quran-detail/[id]" as const,
      params: {
        id: String(lastRead.surahNumber),
        localizedName: lastReadLocalizedName,
        arabicName: lastRead.arabicName,
        versesCount: lastRead.versesCount,
        type: lastRead.type,
        initialVerse: String(lastRead.verseNumber),
      },
    });
  }, [lastRead, lastReadLocalizedName, router]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user-location"] }),
        queryClient.invalidateQueries({ queryKey: ["hijri-date"] }),
        queryClient.invalidateQueries({ queryKey: ["prayer-times"] }),
        queryClient.invalidateQueries({ queryKey: ["dailyVerse"] }),
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
            rightText={getRightLocationText()}
            isLoading={isLoading}
          />
          <PrayerTimes />
        </Animated.View>

        {/* Explore */}
        <Animated.View entering={animation(350)}>
          <SectionTitle
            label={t("home.sectionTitles.explore", "Explore")}
            icon="star-outline"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exploreScrollContent}
          >
            <ExploreCard
              title={t("home.explore.quranAudio.title", "Quran Audio")}
              subtitle={t(
                "home.explore.quranAudio.subtitle",
                "Listen to the Holy Quran",
              )}
              icon="headset-outline"
              watermarkIcon="headphones-alt"
              watermarkFamily="FontAwesome5"
              onPress={() => router.push("/quran-audio")}
            />
            <ExploreCard
              title={t("home.explore.qibla.title", "Qibla")}
              subtitle={t(
                "home.explore.qibla.subtitle",
                "Find the direction of the Kaaba",
              )}
              icon="compass-outline"
              watermarkIcon="kaaba"
              watermarkFamily="FontAwesome5"
              onPress={() => router.push("/(tabs)/qibla")}
            />
            <ExploreCard
              title={t("home.explore.downloads.title", "Downloads")}
              subtitle={t(
                "home.explore.downloads.subtitle",
                "Listen offline anytime",
              )}
              icon="cloud-download-outline"
              watermarkIcon="cloud-download-alt"
              watermarkFamily="FontAwesome5"
              onPress={() => router.push("/(tabs)/library")}
            />
          </ScrollView>
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
              surahName={lastReadLocalizedName}
              verseNumber={lastRead.verseNumber}
              onPress={handleContinueReading}
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
    exploreScrollContent: {
      paddingHorizontal: spacing.screenPadding,
      gap: spacing.sm,
    },
  });
