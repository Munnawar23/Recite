export interface NotificationState {
  isNightlyEnabled: boolean;
  notificationId: string | null;
}

export interface ScheduledNotificationContent {
  title: string;
  body: string;
}

export const NIGHTLY_REMINDER_CONTENT: ScheduledNotificationContent = {
  title: "🌙 Assalamu Alaikum",
  body: "Read or listen to a few verses before you sleep. May Allah bless your night.",
};
