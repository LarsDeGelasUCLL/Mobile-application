// The supported languages. Adding one: an entry here plus a dictionary in
// `dictionaries/` registered in `dictionaries/index.ts`.
// as const: literal language codes (for `keyof typeof`); it asserts no type.
// `label` is the language's own name, so every user can find theirs in the picker.
export const languages = {
  en: { label: "English", intlLocale: "en-GB" },
  nl: { label: "Nederlands", intlLocale: "nl-BE" },
} as const;

export type Language = keyof typeof languages;

export const DEFAULT_LANGUAGE: Language = "en";

/** True for a supported language code. */
export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && Object.hasOwn(languages, value);
}

/** BCP 47 locale for `Intl` / `toLocale*` formatting in `language`. */
export function intlLocale(language: Language): string {
  return languages[language].intlLocale;
}
