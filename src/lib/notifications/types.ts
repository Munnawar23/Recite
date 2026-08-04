export interface NotificationState {
  isNightlyEnabled: boolean;
  notificationId: string | null;
}

export interface ScheduledNotificationContent {
  title: string;
  body: string;
}

export const NIGHTLY_REMINDER_CONTENT: ScheduledNotificationContent = {
  title: "📖 Nightly Reflection",
  body: "Reflect on a verse before bedtime to calm your mind and nourish your heart.",
};
