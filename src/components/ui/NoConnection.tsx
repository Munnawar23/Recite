import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import EmptyState from "./EmptyState";
import { useAppTheme } from "@/hooks/useAppTheme";
import { type ThemeSpacing } from "@/theme";

interface NoConnectionProps {
  onRetry?: () => void;
}

export default function NoConnection({ onRetry }: NoConnectionProps) {
  const { t } = useTranslation();
  const { spacing } = useAppTheme();
  const styles = createStyles(spacing);

  return (
    <View style={styles.container}>
      {onRetry ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t("common.noConnectionTitle", "Connection Error")}
          subtitle={t(
            "common.noConnectionSubtitle",
            "Could not load data. Check your internet connection.",
          )}
          buttonLabel={t("common.retry", "Retry")}
          onPress={onRetry}
        />
      ) : (
        <EmptyState
          icon="cloud-offline-outline"
          title={t("common.noConnectionTitle", "Connection Error")}
          subtitle={t(
            "common.noConnectionSubtitle",
            "Could not load data. Check your internet connection.",
          )}
        />
      )}
    </View>
  );
}

const createStyles = (spacing: ThemeSpacing) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.vXxxl,
      paddingHorizontal: spacing.screenPadding,
    },
  });
