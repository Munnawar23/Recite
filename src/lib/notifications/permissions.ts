import Constants, { ExecutionEnvironment } from "expo-constants";
import { Alert, Linking, Platform } from "react-native";

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Lazily load expo-notifications only when NOT in Expo Go to avoid SDK 53 import throw
let Notifications: typeof import("expo-notifications") | null = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (e) {
    console.warn("Failed to load expo-notifications:", e);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (isExpoGo || !Notifications) {
    console.warn("Expo Go detected or Notifications unavailable: Notifications permissions skipped.");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("recite_reminder_channel_v3", {
      name: "Daily Reminder",
      importance: Notifications.AndroidImportance.MAX,
      sound: "notification", // refers to assets/sfx/notification.mp3 (no extension)
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF236C",
      enableVibrate: true,
      audioAttributes: {
        // ALARM usage tells Android to play at the full alarm/notification volume
        // ignoring silent/DND modes for this channel
        usage: Notifications.AndroidAudioUsage.ALARM,
        contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      },
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  const permRes = await Notifications.getPermissionsAsync();

  if (permRes.status === "granted") {
    return true;
  }

  // If system popup can still be shown (e.g. first time)
  if (permRes.canAskAgain) {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status === "granted";
  }

  // If permanently denied by user, show Alert dialog guiding to Settings
  Alert.alert(
    "Notification Permission Required",
    "Notifications are currently turned off for Recite in your device settings. Would you like to open Settings to enable daily reminders?",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );

  return false;
}

export async function checkNotificationPermissions(): Promise<boolean> {
  if (isExpoGo || !Notifications) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}
