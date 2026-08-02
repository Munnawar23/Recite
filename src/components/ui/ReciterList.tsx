import { MessageModal } from "@/components/ui/MessageModal";
import { RECITER_OPTIONS } from "@/features/quran-detail/hooks/useQuranAudio";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { getChapterAudio } from "@/lib/api/chapter-audio";
import { Haptics } from "@/lib/haptics";
import { useQuranSettingsStore } from "@/store/quranSettingsStore";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

const PLAY_BTN_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

interface ReciterListProps {
  onSelectReciter?: (id: number) => void;
  showSelectedCheckmark?: boolean;
  scrollEnabled?: boolean;
}

export function ReciterList({
  onSelectReciter,
  showSelectedCheckmark = false,
  scrollEnabled = false,
}: ReciterListProps) {
  const { reciterId, setReciterId } = useQuranSettingsStore();
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const { isOffline } = useNetworkStatus();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);

  // Audio Preview State
  const [playingReciterId, setPlayingReciterId] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  const playOnLoadRef = useRef<boolean>(false);

  const player = useAudioPlayer(audioUrl ? { uri: audioUrl } : undefined);
  const status = useAudioPlayerStatus(player);

  // Auto-start playback when audio finishes loading
  useEffect(() => {
    if (status.isLoaded && playOnLoadRef.current) {
      playOnLoadRef.current = false;
      setIsLoadingAudio(false);
      try {
        player.play();
      } catch (err) {
        // ignore
      }
    }
  }, [status.isLoaded, player]);

  // Reset playing state when audio finishes
  useEffect(() => {
    if (status.didJustFinish) {
      setPlayingReciterId(null);
    }
  }, [status.didJustFinish]);

  const safePause = () => {
    try {
      if (player && status.playing) {
        player.pause();
      }
    } catch (err) {
      // ignore
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      safePause();
    };
  }, []);

  // Handle play/pause toggle for Surah 1 audio sample
  const togglePlayAudio = async (targetReciterId: number) => {
    Haptics.medium();

    if (isOffline) {
      setOfflineModalVisible(true);
      return;
    }

    if (playingReciterId === targetReciterId) {
      if (status.playing) {
        safePause();
      } else {
        try {
          player.play();
        } catch (err) {
          // ignore
        }
      }
      return;
    }

    try {
      safePause();
      playOnLoadRef.current = false;
      setIsLoadingAudio(true);
      setPlayingReciterId(targetReciterId);

      const audioFile = await getChapterAudio(1, targetReciterId);
      let url = audioFile?.audio_url;
      if (url?.startsWith("//")) {
        url = `https:${url}`;
      }
      if (url) {
        const freshUrl = `${url}?t=${Date.now()}`;
        playOnLoadRef.current = true;
        setAudioUrl(freshUrl);
        player.replace({ uri: freshUrl });
      } else {
        setIsLoadingAudio(false);
        setPlayingReciterId(null);
      }
    } catch (err) {
      console.warn("Failed to fetch audio preview:", err);
      playOnLoadRef.current = false;
      setIsLoadingAudio(false);
      setPlayingReciterId(null);
    }
  };

  const handleSelectReciter = (id: number) => {
    Haptics.medium();
    setReciterId(id);
    if (onSelectReciter) onSelectReciter(id);
  };

  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <>
      <MessageModal
        visible={offlineModalVisible}
        onClose={() => setOfflineModalVisible(false)}
        title={t("common.offlineAudioPreviewTitle", "Offline Mode")}
        message={t(
          "common.offlineAudioPreviewMessage",
          "Audio previews require an internet connection. You can still listen to your downloaded surahs.",
        )}
        icon="wifi-outline"
      />
      <FlatList
        data={RECITER_OPTIONS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={S.listContainer}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: reciter }) => {
          const isSelected = reciterId === reciter.id;
          const hasError = imageError[reciter.id];
          const isThisPlaying =
            playingReciterId === reciter.id && status.playing;
          const isThisLoading =
            playingReciterId === reciter.id &&
            (isLoadingAudio || (!status.isLoaded && !status.playing));

          return (
            <TouchableOpacity
              style={[S.reciterItem, isSelected && S.selectedItem]}
              onPress={() => handleSelectReciter(reciter.id)}
              activeOpacity={0.7}
            >
              <View style={S.leftSection}>
                {reciter.avatar && !hasError ? (
                  <Image
                    source={
                      typeof reciter.avatar === "string"
                        ? { uri: reciter.avatar }
                        : reciter.avatar
                    }
                    style={S.avatar}
                    onError={() =>
                      setImageError((prev) => ({ ...prev, [reciter.id]: true }))
                    }
                  />
                ) : (
                  <View style={S.avatarFallback}>
                    <Ionicons
                      name="person"
                      size={scale(18)}
                      color={colors.primary}
                    />
                  </View>
                )}
                <Text style={[S.reciterLabel, isSelected && S.selectedLabel]}>
                  {reciter.label}
                </Text>
              </View>

              <View style={S.rightActions}>
                {showSelectedCheckmark && isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={scale(22)}
                    color={colors.primary}
                    style={S.checkmarkIcon}
                  />
                )}

                {/* Audio Preview Play/Pause Button */}
                <TouchableOpacity
                  style={S.playBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    togglePlayAudio(reciter.id);
                  }}
                  activeOpacity={0.7}
                  hitSlop={PLAY_BTN_HIT_SLOP}
                >
                  {isThisLoading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name={isThisPlaying ? "pause-circle" : "play-circle"}
                      size={scale(30)}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    listContainer: {
      gap: spacing.itemGap,
    },
    reciterItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.card,
      borderRadius: scale(14),
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(12),
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedItem: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "12",
    },
    leftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: scale(8),
    },
    avatar: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(23),
      marginRight: scale(12),
      backgroundColor: colors.border,
    },
    avatarFallback: {
      width: scale(46),
      height: scale(46),
      borderRadius: scale(23),
      marginRight: scale(12),
      backgroundColor: colors.primary + "18",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    reciterLabel: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.bodyLg,
      color: colors.text,
      flex: 1,
    },
    selectedLabel: {
      color: colors.primary,
    },
    rightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    checkmarkIcon: {
      marginRight: scale(4),
    },
    playBtn: {
      padding: scale(2),
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default ReciterList;
