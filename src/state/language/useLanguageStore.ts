import { create } from "zustand";
import { deviceLanguage } from "../../i18n/deviceLanguage";
import type { Language } from "../../i18n/languages";
import { resolveLanguage } from "../../i18n/resolveLanguage";
import type { UserSettingsDto } from "../../types";

/** Saved language once settings are loaded; before that / logged out, the device language. */
export function languageFromSettings(
  settings: Pick<UserSettingsDto, "languageCode"> | null,
  device: string | undefined,
): Language {
  return resolveLanguage(settings?.languageCode, device);
}

/** The current app language; `t` and `useI18n` read it. */
interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

// Kept in sync by useSettingsStore. Imports no service, so Storybook and unit tests can use it.
export const useLanguageStore = create<LanguageState>()((set, get) => ({
  language: languageFromSettings(null, deviceLanguage()),
  // Skip identical values so subscribers do not re-render.
  setLanguage: (language) => {
    if (get().language !== language) set({ language });
  },
}));
