import { DEFAULT_LANGUAGE, isLanguage, type Language } from "./languages";

/** Saved `language_code` wins if supported, then the device language, then English. */
export function resolveLanguage(
  saved: string | null | undefined,
  device: string | null | undefined,
): Language {
  if (isLanguage(saved)) return saved;
  if (isLanguage(device)) return device;
  return DEFAULT_LANGUAGE;
}
