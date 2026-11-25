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

export const AUTH_TITLES: Record<AuthMode, string> = {
  login: "Welcome back",
  signup: "Create your account",
  reset: "Reset your password",
  "set-password": "Choose a new password",
  confirmation: "Confirm your email",
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

/** The reset form's opening error after a failed auth link, else "". */
export function authLinkErrorMessage(params: AuthLinkParams): string {
  return hasAuthLinkError(params)
    ? "That reset link could not be completed. Request a new reset email and try again."
    : "";
}
