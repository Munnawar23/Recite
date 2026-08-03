export interface NotificationState {
  isNightlyEnabled: boolean;
  notificationId: string | null;
}

export interface ScheduledNotificationContent {
  title: string;
  body: string;
}

export const NIGHTLY_REMINDER_CONTENTS: ScheduledNotificationContent[] = [
  {
    title: "🌙 Assalamu Alaikum",
    body: "Read or listen to a few verses before you sleep. May Allah bless your night.",
  },
  {
    title: "📖 Nightly Reflection",
    body: "Reflect on a verse before bedtime to calm your mind and nourish your heart.",
  },
];

export const NIGHTLY_REMINDER_CONTENT = NIGHTLY_REMINDER_CONTENTS[0];

