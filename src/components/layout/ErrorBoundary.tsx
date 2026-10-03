import Background from "./Background";
import { AppText } from "../ui/AppText";
import { Button } from "../ui/Button";
import { rs } from "@/helpers/responsiveHelper";
import { useAppTheme } from "@/hooks/useAppTheme";
import "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallbackView onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallbackView({ onReset }: { onReset: () => void }) {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const styles = createStyles(colors, spacing);

  return (
    <View style={styles.outerContainer}>
      <Background />
      <View style={styles.contentContainer}>
        {/* Header Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="warning-outline"
            size={rs.icon(40)}
            color={colors.accent}
          />
        </View>

        {/* Title & Message */}
        <AppText
          variant="heading"
          color="text"
          family="heading"
          align="center"
          style={styles.title}
        >
          {t("errorBoundary.title", "Something Went Wrong")}
        </AppText>

        <AppText
          variant="body"
          color="subtext"
          align="center"
          style={styles.subtitle}
        >
          {t(
            "errorBoundary.subtitle",
            "An unexpected error occurred in the application. You can try restarting or resetting the current view.",
          )}
        </AppText>

        {/* Try Again Button */}
        <Button
          tx="common.tryAgain"
          icon="refresh-outline"
          onPress={onReset}
        />
      </View>
    </View>
  );
}

export const ErrorBoundary = ErrorBoundaryClass;

const createStyles = (
  colors: any,
  spacing: any,
) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.vLg,
      alignItems: "center",
      justifyContent: "center",
    },
    iconContainer: {
      width: rs.space(68),
      height: rs.space(68),
      borderRadius: rs.space(34),
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: rs.space(14),
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    title: {
      marginBottom: rs.space(6),
    },
    subtitle: {
      marginBottom: rs.space(14),
    },
  });
