import { en } from "./dictionaries/en";
import type { Language } from "./languages";
import {
  isTranslationKey,
  translate,
  type PluralKey,
  type TranslationKey,
} from "./translate";

// Dictionary sections whose English text is an exact error message from the server or a service.
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

/** The translation key for an error message: the message itself if it is a key, else a known server message. */
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

// Supabase Auth's per-address email cooldown (signup, resend, reset). The
// message contains the seconds, so it can't be an exact-text key.
const EMAIL_COOLDOWN =
  /^For security purposes, you can only request this (?:after|once every) (\d+) seconds?/;

/** Text for a message with a number in it, else undefined. */
function patternMessage(message: string, language: Language): string | undefined {
  const cooldown = EMAIL_COOLDOWN.exec(message);
  if (!cooldown) return undefined;
  const key: PluralKey = "errors.emailCooldown";
  return translate(language, key, { count: Number(cooldown[1]) });
}

/**
 * User-facing text for a caught error in `language`: an `Error` whose message
 * is a translation key or a known server message (exact or by pattern) is
 * translated; anything else shows `fallbackKey` (raw messages are never shown).
 */
export function translateError(
  error: unknown,
  fallbackKey: TranslationKey,
  language: Language,
): string {
  if (!(error instanceof Error)) return translate(language, fallbackKey);
  const key = messageKey(error.message);
  if (key) return translate(language, key);
  return patternMessage(error.message, language) ?? translate(language, fallbackKey);
}
