import type { TranslationKey } from "../../i18n";

export type AuthMode =
  "login" | "signup" | "reset" | "set-password" | "confirmation";

/** The `/login` search params that pick the opening mode. A type, not an
 * interface: `useLocalSearchParams` needs it to fit its params record. */
export type AuthLinkParams = {
  mode?: string;
  authLinkError?: string;
  error?: string;
  error_code?: string;
};

export const AUTH_TITLES: Record<AuthMode, TranslationKey> = {
  login: "auth.title.login",
  signup: "auth.title.signup",
  reset: "auth.title.reset",
  "set-password": "auth.title.setPassword",
  confirmation: "auth.title.confirmation",
};

function hasAuthLinkError(params: AuthLinkParams): boolean {
  return Boolean(params.authLinkError || params.error || params.error_code);
}

/** A failed auth link opens reset; otherwise the `mode` param, or login.
 * Confirmation is only reached by signing up, never by link. */
export function parseAuthMode(params: AuthLinkParams): AuthMode {
  if (hasAuthLinkError(params)) return "reset";
  switch (params.mode) {
    case "set-password":
    case "reset":
    case "signup":
      return params.mode;
    default:
      return "login";
  }
}

/** The reset form's opening error after a failed auth link, else undefined. */
export function authLinkErrorMessage(
  params: AuthLinkParams,
): TranslationKey | undefined {
  return hasAuthLinkError(params) ? "auth.reset.linkFailed" : undefined;
}
