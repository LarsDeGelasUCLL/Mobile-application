import { dictionaries, type Dictionary } from "./dictionaries";
import { DEFAULT_LANGUAGE, type Language } from "./languages";

export type TranslationKey = keyof Dictionary;

/** `"groups.requests"` for a `"groups.requests_one"` / `"groups.requests_other"` pair. */
export type PluralKey = {
  [K in TranslationKey]: K extends `${infer Base}_other` ? Base : never;
}[TranslationKey];

export type TranslationParams = Record<string, string | number>;

export function isTranslationKey(value: string): value is TranslationKey {
  return Object.hasOwn(dictionaries[DEFAULT_LANGUAGE], value);
}

// Not Intl.PluralRules: Hermes doesn't implement it. English and Dutch share
// this rule; a language with other plural forms needs its own here.
function pluralCategory(count: number): "one" | "other" {
  return count === 1 ? "one" : "other";
}

function templateKey(key: string, count: unknown): TranslationKey | undefined {
  if (typeof count === "number") {
    const variant = `${key}_${pluralCategory(count)}`;
    if (isTranslationKey(variant)) return variant;
  }
  if (isTranslationKey(key)) return key;
  const other = `${key}_other`;
  return isTranslationKey(other) ? other : undefined;
}

/**
 * Text for `key` in `language`, with `{name}` placeholders filled from
 * `params`. With a numeric `params.count`, a plural key picks its `_one` /
 * `_other` variant. Falls back to English, then to the key itself; a
 * placeholder without a param stays as written.
 */
export function translate(
  language: Language,
  key: TranslationKey | PluralKey,
  params: TranslationParams = {},
): string {
  const resolved = templateKey(key, params.count);
  const template = resolved
    ? (dictionaries[language][resolved] ?? dictionaries[DEFAULT_LANGUAGE][resolved])
    : key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : match,
  );
}
