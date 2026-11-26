import { getLocales } from "expo-localization";

/** The device's preferred language code (`"nl"`), or `undefined` where unknown (e.g. web static render on Node). */
export function deviceLanguage(): string | undefined {
  try {
    return getLocales()[0]?.languageCode ?? undefined;
  } catch {
    return undefined;
  }
}
