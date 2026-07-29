import {
  cancelDailyNightlyNotification,
  requestNotificationPermissions,
  scheduleDailyNightlyNotification,
} from "@/lib/notifications";
import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotificationStoreState {
  isNightlyEnabled: boolean;
  notificationId: string | null;
  toggleNightlyNotification: (enabled?: boolean) => Promise<boolean>;
}

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      isNightlyEnabled: false,
      notificationId: null,

      toggleNightlyNotification: async (enabled?: boolean) => {
        const currentState = get().isNightlyEnabled;
        const targetEnabled = enabled ?? !currentState;

        if (targetEnabled) {
          const granted = await requestNotificationPermissions();
          if (!granted) {
            set({ isNightlyEnabled: false, notificationId: null });
            return false;
          }

          // Cancel any existing notification before rescheduling
          if (get().notificationId) {
            await cancelDailyNightlyNotification(get().notificationId);
          }

          const id = await scheduleDailyNightlyNotification();
          if (id) {
            set({ isNightlyEnabled: true, notificationId: id });
            return true;
          } else {
            set({ isNightlyEnabled: false, notificationId: null });
            return false;
          }
        } else {
          if (get().notificationId) {
            await cancelDailyNightlyNotification(get().notificationId);
          }
          set({ isNightlyEnabled: false, notificationId: null });
          return true;
        }
      },
    }),
    {
      name: STORAGE_KEYS.NOTIFICATION,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
