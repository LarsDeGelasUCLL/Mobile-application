import { Platform } from "react-native";

/**
 * Where an auth email link (or later an OAuth redirect) opens the app: this
 * web origin, or the native scheme. `path` has no leading slash, e.g.
 * `"login?mode=set-password"`. Each origin must be in Supabase's Redirect URLs.
 */
export function authRedirectUrl(path: string): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/${path}`;
  }
  return `laruna://${path}`;
}
