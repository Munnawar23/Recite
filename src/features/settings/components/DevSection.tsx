import SectionTitle from "@/components/ui/SectionTitle";
import { useAppTheme } from "@/hooks/useAppTheme";
import { triggerInstantTestNotification } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { scale, verticalScale } from "react-native-size-matters";

export default function DevSection() {
  const { colors, fontFamily, fontSize, spacing } = useAppTheme();
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    throw new Error("Test Error triggered manually from Developer Options.");
  }

  const handleTestNotification = async () => {
    try {
      await triggerInstantTestNotification();
      Alert.alert("Notification Triggered", "Sent test notification trigger.");
    } catch (e) {
      Alert.alert("Notification Error", String(e));
    }
  };

  const handleTriggerError = () => {
    Alert.alert(
      "Trigger Error Boundary",
      "Are you sure you want to trigger a test crash for the Error Boundary?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Trigger Crash",
          style: "destructive",
          onPress: () => setShouldCrash(true),
        },
      ]
    );
  };

  const S = createStyles(colors, fontFamily, fontSize, spacing);

  return (
    <View style={S.container}>
      <SectionTitle
        label="Developer Options"
        icon="code-working-outline"
        tightSpacing
      />

      <View style={S.card}>
        {/* Trigger Test Notification Button */}
        <TouchableOpacity
          style={S.buttonRow}
          onPress={handleTestNotification}
          activeOpacity={0.7}
        >
          <View style={S.iconCircle}>
            <Ionicons
              name="notifications-circle-outline"
              size={scale(20)}
              color={colors.primary}
            />
          </View>
          <View style={S.textContainer}>
            <Text style={S.buttonTitle}>Test Notification</Text>
            <Text style={S.buttonSubtitle}>Send instant 1s test notification</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={scale(18)}
            color={colors.subtext}
          />
        </TouchableOpacity>

        <View style={S.divider} />

        {/* Trigger Error Boundary Button */}
        <TouchableOpacity
          style={S.buttonRow}
          onPress={handleTriggerError}
          activeOpacity={0.7}
        >
          <View style={[S.iconCircle, { backgroundColor: colors.accent + "18" }]}>
            <Ionicons
              name="warning-outline"
              size={scale(18)}
              color={colors.accent}
            />
          </View>
          <View style={S.textContainer}>
            <Text style={[S.buttonTitle, { color: colors.accent }]}>
              Trigger Error Boundary
            </Text>
            <Text style={S.buttonSubtitle}>Simulate an unhandled app crash</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={scale(18)}
            color={colors.subtext}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (
  colors: any,
  fontFamily: any,
  fontSize: any,
  spacing: any,
) =>
  StyleSheet.create({
    container: {
      marginTop: verticalScale(14),
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: spacing.screenPadding,
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    buttonRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(14),
      paddingVertical: verticalScale(12),
      gap: scale(12),
    },
    iconCircle: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    textContainer: {
      flex: 1,
      gap: verticalScale(2),
    },
    buttonTitle: {
      fontFamily: fontFamily.title,
      fontSize: fontSize.body,
      color: colors.text,
    },
    buttonSubtitle: {
      fontFamily: fontFamily.text,
      fontSize: fontSize.caption,
      color: colors.subtext,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: scale(14),
    },
  });
