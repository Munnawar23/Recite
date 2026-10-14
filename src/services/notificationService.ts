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

export interface ReminderNotificationTemplate {
  hour: number;
  minute: number;
  title: string;
  body: string;
  cycleKey: string;
}

// 3-Slot Rotating Cycle Definitions
export const REMINDER_CYCLE: ReminderNotificationTemplate[] = [
  {
    hour: 23,
    minute: 0,
    title: "🌙 Sleep in Peace",
    body: "Calm your mind before sleeping with a few verses of the Quran ✨",
    cycleKey: "sleep_in_peace_11pm",
  },
  {
    hour: 22,
    minute: 0,
    title: "🕯️ Light in the Night",
    body: "Step away from the screen for 5 minutes and read some Quran 🤲",
    cycleKey: "light_in_the_night_10pm",
  },
  {
    hour: 7,
    minute: 0,
    title: "☀️ Good Morning",
    body: "Start your day on a good note. Open the Quran for a few minutes 🌞",
    cycleKey: "good_morning_7am",
  },
];

const SCHEDULE_DAYS_COUNT = 14;
const CHANNEL_ID = "daily-reminder-v2";

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
          await Notifications!.setNotificationChannelAsync(CHANNEL_ID, {
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

  /**
   * Schedules a 14-day rolling cycle of rotating notifications:
   * Day 1: 11:00 PM (Sleep in Peace)
   * Day 2: 10:00 PM (Light in the Night)
   * Day 3: 7:00 AM (Good Morning)
   * Repeating across the 14 days.
   */
  static async scheduleDailyNotification(): Promise<boolean> {
    if (!this.isSupported || !Notifications) {
      return false;
    }
    this.configure();

    try {
      // 1. Cancel all previously scheduled reminders to prevent stacking
      await this.cancelDailyNotification();

      const now = new Date();
      let scheduledCount = 0;

      for (let dayOffset = 0; dayOffset < SCHEDULE_DAYS_COUNT; dayOffset++) {
        const item = REMINDER_CYCLE[dayOffset % REMINDER_CYCLE.length];

        const targetDate = new Date();
        targetDate.setDate(now.getDate() + dayOffset);
        targetDate.setHours(item.hour, item.minute, 0, 0);

        // If time already passed for today, push it forward to the next day slot
        if (targetDate.getTime() <= now.getTime()) {
          targetDate.setDate(targetDate.getDate() + 1);
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: item.title,
            body: item.body,
            data: {
              type: "daily_read_reminder",
              cycleKey: item.cycleKey,
              dayIndex: dayOffset,
            },
            sound: "notification.mp3",
          },
          trigger:
            Platform.OS === "android"
              ? ({
                  type: "date",
                  date: targetDate,
                  channelId: CHANNEL_ID,
                } as any)
              : {
                  type: "date",
                  date: targetDate,
                },
        });

        scheduledCount++;
      }

      console.log(`[NotificationService] Successfully scheduled ${scheduledCount} days of rotating notifications.`);
      return true;
    } catch (error) {
      console.error("[NotificationService] Error scheduling 14-day cycle notifications:", error);
      return false;
    }
  }

  /**
   * Cancels all scheduled reminder notifications
   */
  static async cancelDailyNotification(): Promise<void> {
    if (!this.isSupported || !Notifications) {
      return;
    }
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const reminders = scheduled.filter(
        (n) => n.content.data?.type === "daily_read_reminder",
      );

      for (const item of reminders) {
        await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
      console.log(`[NotificationService] Cancelled ${reminders.length} reminder notifications.`);
    } catch (error) {
      console.error("[NotificationService] Error cancelling reminders:", error);
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
            ? ({ channelId: CHANNEL_ID } as any)
            : null,
      });
      return true;
    } catch (error) {
      console.error("Error sending instant test notification:", error);
      return false;
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
