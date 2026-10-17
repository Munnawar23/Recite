import Constants, { ExecutionEnvironment } from "expo-constants";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { Linking, Platform } from "react-native";

export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof import("expo-notifications") | null = null;
let moduleLoadError: Error | null = null;

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
  } catch (error: unknown) {
    moduleLoadError =
      error instanceof Error ? error : new Error(String(error));
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
  private static configurePromise: Promise<void> | null = null;

  static get isSupported(): boolean {
    return !isExpoGo && Notifications !== null;
  }

  static isHealthy(): boolean {
    return this.isSupported && moduleLoadError === null;
  }

  static getModuleLoadError(): Error | null {
    return moduleLoadError;
  }

  static async configure(): Promise<void> {
    if (!this.isSupported || !Notifications) return;
    if (this.configurePromise) return this.configurePromise;

    this.configurePromise = (async () => {
      try {
        Notifications!.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        // Set up the Android notification channel.
        if (Platform.OS === "android") {
          await Notifications!.setNotificationChannelAsync(CHANNEL_ID, {
            name: "Daily Reminder",
            importance: Notifications!.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
            // Must be bundled on both platforms: assets/ + expo-notifications plugin on iOS, res/raw/ on Android
            sound: "notification.mp3",
          });
        }
      } catch (error) {
        this.configurePromise = null;
        console.warn("[NotificationService] configure error:", error);
      }
    })();

    return this.configurePromise;
  }

  static async getPermissionsAsync(): Promise<{
    status: "granted" | "denied" | "undetermined";
    canAskAgain: boolean;
  }> {
    if (!this.isSupported || !Notifications) {
      return { status: "denied", canAskAgain: false };
    }
    try {
      const res = await Notifications.getPermissionsAsync();
      const status: "granted" | "denied" | "undetermined" =
        res.status === "granted"
          ? "granted"
          : res.status === "undetermined"
            ? "undetermined"
            : "denied";
      return { status, canAskAgain: res.canAskAgain };
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
    await this.configure();

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
    if (!(await this.isPermissionGranted())) {
      return false;
    }
    await this.configure();

    try {
      // 1. Cancel all previously scheduled reminders to prevent stacking
      await this.cancelDailyNotification();

      const now = new Date();
      let scheduledCount = 0;
      let slotIndex = 0;

      for (let dayOffset = 0; slotIndex < SCHEDULE_DAYS_COUNT; dayOffset++) {
        const item = REMINDER_CYCLE[slotIndex % REMINDER_CYCLE.length];

        const targetDate = new Date();
        targetDate.setDate(now.getDate() + dayOffset);
        targetDate.setHours(item.hour, item.minute, 0, 0);

        // If time already passed for today, skip past slot instead of shifting
        if (targetDate.getTime() <= now.getTime()) {
          continue;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: item.title,
            body: item.body,
            data: {
              type: "daily_read_reminder",
              cycleKey: item.cycleKey,
              dayIndex: slotIndex,
            },
            // Must be bundled on both platforms: assets/ + expo-notifications plugin on iOS, res/raw/ on Android
            sound: "notification.mp3",
          },
          trigger:
            Platform.OS === "android"
              ? {
                  type: SchedulableTriggerInputTypes.DATE,
                  date: targetDate,
                  channelId: CHANNEL_ID,
                }
              : {
                  type: SchedulableTriggerInputTypes.DATE,
                  date: targetDate,
                },
        });

        slotIndex++;
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
