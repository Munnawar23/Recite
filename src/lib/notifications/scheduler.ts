import { isExpoGo } from "./permissions";
import { NIGHTLY_REMINDER_CONTENTS } from "./types";

let Notifications: typeof import("expo-notifications") | null = null;
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: Notifications!.AndroidNotificationPriority.HIGH,
        }),
      });
    }
  } catch (e) {
    console.warn("Failed to load expo-notifications:", e);
  }
}

/**
 * Schedules weekly recurring notifications at 10:00 PM (22:00 local time).
 * Uses OS recurring weekly alarms for all 7 days of the week, alternating between
 * Message 1 and Message 2. This guarantees notifications will trigger forever
 * (1, 2, or 5+ years) even if the user never opens the app.
 */
export async function scheduleDailyNightlyNotification(): Promise<string | null> {
  if (isExpoGo || !Notifications) {
    return null;
  }
  try {
    // Clear existing notifications to prevent duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const scheduledIds: string[] = [];

    // Weekdays in Expo Notifications: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
    for (let weekday = 1; weekday <= 7; weekday++) {
      // Alternate content based on day of week (0 to 6)
      const content = NIGHTLY_REMINDER_CONTENTS[(weekday - 1) % NIGHTLY_REMINDER_CONTENTS.length];

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          sound: "notification.mp3", // iOS uses this; Android uses channel sound
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday, // 1 to 7
          hour: 22,
          minute: 0,
          channelId: "recite_reminder_channel_v4",
        },
      });

      if (identifier) {
        scheduledIds.push(identifier);
      }
    }

    return scheduledIds.length > 0 ? scheduledIds.join(",") : null;
  } catch (error) {
    console.error("Failed to schedule daily nightly notification:", error);
    return null;
  }
}


/**
 * Cancels scheduled notifications by identifier or clears all scheduled alerts.
 */
export async function cancelDailyNightlyNotification(identifier: string | null): Promise<void> {
  if (isExpoGo || !Notifications) return;

  try {
    if (identifier) {
      const ids = identifier.split(",");
      await Promise.all(
        ids.map((id) => Notifications!.cancelScheduledNotificationAsync(id.trim()))
      );
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (error) {
    console.error("Failed to cancel scheduled notification:", error);
  }
}



