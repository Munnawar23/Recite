import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { NotificationService } from "@/services/NotificationService";
import * as Notifications from "expo-notifications";

interface NotificationState {
  isDailyReminderEnabled: boolean;
  isPermissionBlocked: boolean;
  setIsDailyReminderEnabled: (value: boolean) => void;
  /**
   * Toggle the daily reminder on/off.
   * Returns:
   *   'enabled'  – successfully scheduled
   *   'disabled' – successfully cancelled
   *   'blocked'  – OS permission permanently denied; UI should prompt user to open Settings
   *   'denied'   – OS permission denied (can ask again next time)
   */
  toggleDailyReminder: () => Promise<'enabled' | 'disabled' | 'blocked' | 'denied'>;
  /**
   * Called on app startup: syncs store with actual OS permission state
   * and reschedules the notification if it was lost (e.g. after reinstall).
   */
  syncOnStartup: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      isDailyReminderEnabled: false,
      isPermissionBlocked: false,

      setIsDailyReminderEnabled: (value) => set({ isDailyReminderEnabled: value }),

      toggleDailyReminder: async () => {
        const current = get().isDailyReminderEnabled;

        if (!current) {
          // --- Turning ON ---
          const result = await NotificationService.requestPermissionsAsync();

          if (result === 'granted') {
            await NotificationService.scheduleDailyNotification();
            set({ isDailyReminderEnabled: true, isPermissionBlocked: false });
            return 'enabled';
          }

          if (result === 'blocked') {
            set({ isPermissionBlocked: true });
            return 'blocked';
          }

          // 'denied' – user tapped Don't Allow; can try again later
          return 'denied';
        } else {
          // --- Turning OFF ---
          await NotificationService.cancelDailyNotification();
          set({ isDailyReminderEnabled: false, isPermissionBlocked: false });
          return 'disabled';
        }
      },

      syncOnStartup: async () => {
        const { isDailyReminderEnabled } = get();
        const granted = await NotificationService.isPermissionGranted();

        if (!granted) {
          // Permission was revoked from system settings → reflect in store
          const { status, canAskAgain } = await Notifications.getPermissionsAsync();
          set({
            isDailyReminderEnabled: false,
            isPermissionBlocked: !canAskAgain && status !== 'granted',
          });
          return;
        }

        // Permission is still valid
        set({ isPermissionBlocked: false });

        if (isDailyReminderEnabled) {
          // Reschedule if the OS cleared our notification (reinstall, etc.)
          await NotificationService.scheduleDailyNotification();
        }
      },
    }),
    {
      name: STORAGE_KEYS.NOTIFICATION,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
