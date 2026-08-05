import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

export class NotificationService {
  private static isConfigured = false;

  static configure() {
    if (this.isConfigured) return;
    this.isConfigured = true;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Set up the Android notification channel.
    // NOTE: Before releasing to production, bump the channel ID (e.g. v3)
    // any time you change the sound — Android caches channel settings permanently.
    if (Platform.OS === "android") {
      void (async () => {
        await Notifications.setNotificationChannelAsync("daily-reminder-v2", {
          name: "Daily Reminder",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "notification.mp3",
        });
      })();
    }
  }

  static async requestPermissionsAsync(): Promise<
    "granted" | "denied" | "blocked"
  > {
    this.configure();

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      return "granted";
    }

    const { status, canAskAgain } =
      await Notifications.requestPermissionsAsync();

    if (status === "granted") {
      return "granted";
    }

    if (!canAskAgain) {
      return "blocked";
    }

    return "denied";
  }

  static async openAppSettings(): Promise<void> {
    await Linking.openSettings();
  }

  static async scheduleDailyNotification(): Promise<string | null> {
    this.configure();

    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      const existingNotif = scheduledNotifications.find(
        (notif) => notif.content.data?.type === "daily_read_reminder",
      );

      if (existingNotif) {
        await Notifications.cancelScheduledNotificationAsync(
          existingNotif.identifier,
        );
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌙 Before You Sleep",
          body: "Take a peaceful moment before sleep to read and reflect upon the Holy Quran 🤲",
          data: { type: "daily_read_reminder" },
          sound: "notification.mp3",
        },
        trigger: {
          type: "daily",
          hour: 23,
          minute: 0,
          channelId: "daily-reminder-v2",
        } as Notifications.NotificationTriggerInput,
      });

      console.log("Daily notification scheduled with ID:", id);
      return id;
    } catch (error) {
      console.error("Error scheduling daily notification:", error);
      return null;
    }
  }

  /**
   * Triggers an instant notification (for Developer testing)
   */
  static async sendTestNotification(): Promise<boolean> {
    this.configure();
    try {
      const permission = await this.requestPermissionsAsync();
      if (permission !== "granted") {
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🧪 Test Notification Delivered! 🎉",
          body: "Your daily Quran reminder notifications are configured and working perfectly 📖✨",
          data: { type: "test_notification" },
          sound: "notification.mp3",
        },
        trigger:
          Platform.OS === "android"
            ? ({ channelId: "daily-reminder-v2" } as any)
            : null,
      });
      return true;
    } catch (error) {
      console.error("Error sending instant test notification:", error);
      return false;
    }
  }

  static async cancelDailyNotification(): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const daily = scheduled.find(
        (n) => n.content.data?.type === "daily_read_reminder",
      );

      if (daily) {
        await Notifications.cancelScheduledNotificationAsync(daily.identifier);
        console.log("Daily notification cancelled:", daily.identifier);
      }
    } catch (error) {
      console.error("Error cancelling daily notification:", error);
    }
  }

  static async isPermissionGranted(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }
}
