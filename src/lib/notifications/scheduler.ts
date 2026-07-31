import * as Notifications from "expo-notifications";
import { requestNotificationPermissions } from "./permissions";
import { NIGHTLY_REMINDER_CONTENT } from "./types";

// Configure default notification handler for foreground notification display
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Schedules a daily recurring notification at 10:00 PM (22:00 local time).
 */
export async function scheduleDailyNightlyNotification(): Promise<string | null> {
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
  if (!identifier) return;

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
