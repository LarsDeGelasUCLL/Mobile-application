import { create } from "zustand";
import { deviceLanguage } from "../../i18n/deviceLanguage";
import {
  languageFromSettings,
  useLanguageStore,
} from "../language/useLanguageStore";
import { createSettingsActions } from "./settingsStoreActions";
import type { SettingsState } from "./settingsStoreTypes";

/** The signed-in user's settings (theme, language, notifications). */
export const useSettingsStore = create<SettingsState>()((...args) => ({
  settings: null,
  isLoading: false,
  error: null,
  ...createSettingsActions(...args),
}));

// The app language follows the saved setting (fetch, save) and falls back to
// the device language when settings are cleared (logout).
useSettingsStore.subscribe((state, previous) => {
  if (state.settings === previous.settings) return;
  useLanguageStore
    .getState()
    .setLanguage(languageFromSettings(state.settings, deviceLanguage()));
});
