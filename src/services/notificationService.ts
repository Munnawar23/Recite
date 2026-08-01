import {
  cancelDailyNightlyNotification,
  requestNotificationPermissions,
  scheduleDailyNightlyNotification,
} from "@/lib/notifications";

export interface ToggleNotificationResult {
  success: boolean;
  enabled: boolean;
  notificationId: string | null;
}

/**
 * Handles scheduling, canceling, and permission requests for daily notifications.
 */
export async function toggleNotificationService(
  currentEnabled: boolean,
  currentId: string | null,
  targetEnabled?: boolean,
): Promise<ToggleNotificationResult> {
  const desiredState = targetEnabled ?? !currentEnabled;

  // 1. Cancel existing scheduled notification if present
  if (currentId) {
    try {
      await cancelDailyNightlyNotification(currentId);
    } catch (err) {
      console.warn("[notificationService] Failed to cancel existing notification:", err);
    }
  }

  // 2. If user wants to disable
  if (!desiredState) {
    return {
      success: true,
      enabled: false,
      notificationId: null,
    };
  }

  // 3. Request permissions if enabling
  const granted = await requestNotificationPermissions();
  if (!granted) {
    return {
      success: false,
      enabled: false,
      notificationId: null,
    };
  }

  // 4. Schedule new notification
  const newId = await scheduleDailyNightlyNotification();
  if (newId) {
    return {
      success: true,
      enabled: true,
      notificationId: newId,
    };
  }

  return {
    success: false,
    enabled: false,
    notificationId: null,
  };
}
