import { useLanguageStore } from "../state/language/useLanguageStore";
import { translateError } from "./errors";
import {
  translate,
  type PluralKey,
  type TranslationKey,
  type TranslationParams,
} from "./translate";

/** Non-hook `t` for async code (store actions, event handlers). Render code uses `useI18n().t`. */
export function t(key: TranslationKey | PluralKey, params?: TranslationParams): string {
  return translate(useLanguageStore.getState().language, key, params);
}

/** Text for a caught error in the current language; see `translateError`. */
export function errorMessage(error: unknown, fallbackKey: TranslationKey): string {
  return translateError(error, fallbackKey, useLanguageStore.getState().language);
}
