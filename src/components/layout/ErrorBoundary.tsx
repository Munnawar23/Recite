import Background from "@/components/layout/Background";
import SafeArea from "@/components/layout/SafeArea";
import Button from "@/components/ui/Button";
import { useAppTheme } from "@/hooks/useAppTheme";
import "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { Component, ErrorInfo, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

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
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const styles = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <View style={styles.outerContainer}>
      <Background />
      <SafeArea>
        <View style={styles.contentContainer}>
          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="warning-outline"
              size={scale(40)}
              color={colors.accent}
            />
          </View>

          {/* Title & Message */}
          <Text style={styles.title}>
            {t("errorBoundary.title", "Something Went Wrong")}
          </Text>

          <Text style={styles.subtitle}>
            {t(
              "errorBoundary.subtitle",
              "An unexpected error occurred in the application. You can try restarting or resetting the current view.",
            )}
          </Text>

          {/* Try Again Button */}
          <Button
            tx="common.tryAgain"
            icon="refresh-outline"
            onPress={onReset}
          />
        </View>
      </SafeArea>
    </View>
  );
}

export const ErrorBoundary = ErrorBoundaryClass;

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
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
      width: scale(68),
      height: scale(68),
      borderRadius: scale(34),
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: verticalScale(14),
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    title: {
      textAlign: "center",
      marginBottom: verticalScale(6),
      color: colors.text,
      fontFamily: fontFamily.heading,
      fontSize: fontSize.heading,
    },
    subtitle: {
      textAlign: "center",
      marginBottom: verticalScale(14),
      color: colors.subtext,
      fontFamily: fontFamily.text,
      fontSize: fontSize.body,
    },
  });
