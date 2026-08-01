import { STORAGE_KEYS, zustandStorage } from "@/lib/storage/appStorage";
import { toggleNotificationService } from "@/services/notificationService";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface NotificationStoreState {
  isNotificationsEnabled: boolean;
  notificationId: string | null;
  isLoading: boolean;
  /**
   * Toggles or sets daily reminder notifications.
   * Handles permission checks, scheduling, and canceling existing alerts.
   * Returns a promise resolving to boolean success.
   */
  toggleNotifications: (enabled?: boolean) => Promise<boolean>;
}

export const useNotificationStore = create<NotificationStoreState>()(
  persist(
    (set, get) => ({
      isNotificationsEnabled: false,
      notificationId: null,
      isLoading: false,

      toggleNotifications: async (enabled?: boolean) => {
        const state = get();

        // Prevent duplicate concurrent toggle calls
        if (state.isLoading) return false;

        set({ isLoading: true });

        try {
          const result = await toggleNotificationService(
            state.isNotificationsEnabled,
            state.notificationId,
            enabled,
          );
          set({
            isNotificationsEnabled: result.enabled,
            notificationId: result.notificationId,
          });

          return result.success;
        } catch (error) {
          console.error("[notificationStore] Unexpected toggle error:", error);
          set({ isNotificationsEnabled: false, notificationId: null });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: STORAGE_KEYS.NOTIFICATION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        isNotificationsEnabled: state.isNotificationsEnabled,
        notificationId: state.notificationId,
      }),
    },
  ),
);
