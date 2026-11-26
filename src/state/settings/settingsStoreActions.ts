import { getUserSettings, updateUserSettings } from "../../services";
import type { SettingsActionCreator } from "./settingsStoreTypes";
import { errorMessage } from "../../i18n";

export const createSettingsActions: SettingsActionCreator = (set) => ({
  fetchSettings: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await getUserSettings(userId);
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: errorMessage(error, "errors.fallback.loadSettings"),
        isLoading: false,
      });
      throw error;
    }
  },

  updateSettings: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await updateUserSettings(userId, payload);
      set({ settings, isLoading: false });
      return settings;
    } catch (error) {
      set({
        error: errorMessage(error, "errors.fallback.updateSettings"),
        isLoading: false,
      });
      throw error;
    }
  },

  resetSettings: () =>
    set({
      settings: null,
      isLoading: false,
      error: null,
    }),
});
