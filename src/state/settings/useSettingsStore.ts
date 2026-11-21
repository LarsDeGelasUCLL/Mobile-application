import { create } from "zustand";
import { createSettingsActions } from "./settingsStoreActions";
import type { SettingsState } from "./settingsStoreTypes";

export const useSettingsStore = create<SettingsState>()((...args) => ({
  settings: null,
  isLoading: false,
  error: null,
  ...createSettingsActions(...args),
}));
