import { isExpoGo, requestNotificationPermissions } from "./permissions";
import { NIGHTLY_REMINDER_CONTENT } from "./types";

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
 * Schedules a daily recurring notification at 10:00 PM (22:00 local time).
 */
export async function scheduleDailyNightlyNotification(): Promise<string | null> {
  if (isExpoGo || !Notifications) {
    return null;
  }
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: NIGHTLY_REMINDER_CONTENT.title,
        body: NIGHTLY_REMINDER_CONTENT.body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 22,
        minute: 0,
        channelId: "recite_reminder_channel_v2",
      },
    });

    return identifier;
  } catch (error) {
    console.error("Failed to schedule daily nightly notification:", error);
    return null;
  }
}

/**
 * Cancels a scheduled notification by identifier.
 */
export async function cancelDailyNightlyNotification(identifier: string | null): Promise<void> {
  if (!identifier || isExpoGo || !Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error("Failed to cancel scheduled notification:", error);
  }
}

/**
 * Instantly triggers a test notification for testing.
 */
export async function triggerInstantTestNotification(): Promise<void> {
  if (isExpoGo || !Notifications) return;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: NIGHTLY_REMINDER_CONTENT.title,
        body: NIGHTLY_REMINDER_CONTENT.body,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: "recite_reminder_channel_v2",
      },
    });
  } catch (error) {
    console.error("Failed to trigger instant test notification:", error);
  }
}
