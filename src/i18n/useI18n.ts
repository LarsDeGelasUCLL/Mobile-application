import { useMemo } from "react";
import { useLanguageStore } from "../state/language/useLanguageStore";
import { intlLocale, type Language } from "./languages";
import {
  translate,
  type PluralKey,
  type TranslationKey,
  type TranslationParams,
} from "./translate";

export interface I18n {
  t: (key: TranslationKey | PluralKey, params?: TranslationParams) => string;
  language: Language;
  /** `Intl` locale for amounts and dates. */
  locale: string;
}

/** Translation for render code; re-renders when the language changes. */
export function useI18n(): I18n {
  const language = useLanguageStore((state) => state.language);
  return useMemo(
    () => ({
      t: (key, params) => translate(language, key, params),
      language,
      locale: intlLocale(language),
    }),
    [language],
  );
}
