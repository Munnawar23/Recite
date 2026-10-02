import Constants, { ExecutionEnvironment } from "expo-constants";
import { Linking, Platform } from "react-native";

export const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof import("expo-notifications") | null = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (error) {
    console.warn("[NotificationService] expo-notifications could not be loaded:", error);
  }
}

export class NotificationService {
  private static isConfigured = false;

  static get isSupported(): boolean {
    return !isExpoGo && Notifications !== null;
  }

  static configure() {
    if (!this.isSupported || !Notifications) return;
    if (this.isConfigured) return;
    this.isConfigured = true;

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Set up the Android notification channel.
      if (Platform.OS === "android") {
        void (async () => {
          await Notifications!.setNotificationChannelAsync("daily-reminder-v2", {
            name: "Daily Reminder",
            importance: Notifications!.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            sound: "notification.mp3",
          });
        })();
      }
    } catch (error) {
      console.warn("[NotificationService] configure error:", error);
    }
  }

  static async getPermissionsAsync(): Promise<{ status: string; canAskAgain: boolean }> {
    if (!this.isSupported || !Notifications) {
      return { status: "denied", canAskAgain: false };
    }
    try {
      return await Notifications.getPermissionsAsync();
    } catch {
      return { status: "denied", canAskAgain: false };
    }
  }

  static async requestPermissionsAsync(): Promise<
    "granted" | "denied" | "blocked"
  > {
    if (!this.isSupported || !Notifications) {
      return "denied";
    }
    this.configure();

    try {
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
    } catch {
      return "denied";
    }
  }

  static async openAppSettings(): Promise<void> {
    await Linking.openSettings();
  }

  static async scheduleDailyNotification(): Promise<string | null> {
    if (!this.isSupported || !Notifications) {
      return null;
    }
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
        } as any,
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
    if (!this.isSupported || !Notifications) {
      return false;
    }
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
    if (!this.isSupported || !Notifications) {
      return;
    }
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
    if (!this.isSupported || !Notifications) {
      return false;
    }
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  }
}
