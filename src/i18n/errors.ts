import { en } from "./dictionaries/en";
import type { Language } from "./languages";
import { isTranslationKey, translate, type TranslationKey } from "./translate";

const MESSAGE_KEY_PREFIXES = ["errors.server.", "errors.auth.", "errors.service."];

/**
 * English server / Supabase Auth / service message → its key. Built from
 * `en`: under these prefixes the English text is the message verbatim.
 */
export const serverMessageKeys: Record<string, TranslationKey> = {};
for (const key of Object.keys(en)) {
  if (
    isTranslationKey(key) &&
    MESSAGE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
  ) {
    serverMessageKeys[en[key]] = key;
  }
}

function messageKey(message: string): TranslationKey | undefined {
  if (isTranslationKey(message)) return message;
  // Supabase wording drifts on the trailing period.
  for (const candidate of [message, message.replace(/\.$/, "")]) {
    if (Object.hasOwn(serverMessageKeys, candidate)) {
      return serverMessageKeys[candidate];
    }
  }
  return undefined;
}

/**
 * User-facing text for a caught error in `language`: an `Error` whose message
 * is a translation key or a known server message is translated; anything
 * else shows `fallbackKey` (raw messages are never shown).
 */
export function translateError(
  error: unknown,
  fallbackKey: TranslationKey,
  language: Language,
): string {
  const key = error instanceof Error ? messageKey(error.message) : undefined;
  return translate(language, key ?? fallbackKey);
}
