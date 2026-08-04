import { isExpoGo } from "./permissions";
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

export async function scheduleDailyNightlyNotification(): Promise<
  string | null
> {
  if (isExpoGo || !Notifications) {
    return null;
  }
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: NIGHTLY_REMINDER_CONTENT.title,
        body: NIGHTLY_REMINDER_CONTENT.body,
        sound: "notification.mp3",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 23,
        minute: 0,
        channelId: "recite_reminder_channel_v4",
      },
    });

    return identifier ?? null;
  } catch (error) {
    console.error("Failed to schedule daily nightly notification:", error);
    return null;
  }
}

/**
 * Cancels scheduled notifications by identifier or clears all scheduled alerts.
 */
export async function cancelDailyNightlyNotification(
  identifier: string | null,
): Promise<void> {
  if (isExpoGo || !Notifications) return;

  try {
    if (identifier) {
      const ids = identifier.split(",");
      await Promise.all(
        ids.map((id) =>
          Notifications!.cancelScheduledNotificationAsync(id.trim()),
        ),
      );
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (error) {
    console.error("Failed to cancel scheduled notification:", error);
  }
}
