// Client-side checks for the auth forms. Each returns the dictionary key of
// the error to show, or undefined when the value is fine.
import type { TranslationKey } from "../../i18n";

export function validateEmail(email: string): TranslationKey | undefined {
  const value = email.trim();
  if (!value) {
    return "validation.emailRequired";
  }
  // Rough shape check (x@y.z); Supabase does the real validation.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "validation.emailInvalid";
  }
  return undefined;
}

export function validatePassword(
  password: string,
): TranslationKey | undefined {
  if (!password) {
    return "validation.passwordRequired";
  }
  if (password.length < 8) {
    return "validation.passwordTooShort";
  }
  return undefined;
}

export function validateDisplayName(
  displayName: string,
): TranslationKey | undefined {
  if (!displayName.trim()) {
    return "validation.displayNameRequired";
  }
  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  confirmPassword: string,
): TranslationKey | undefined {
  return confirmPassword === password
    ? undefined
    : "validation.passwordsMustMatch";
}

export interface NewPasswordErrors {
  passwordError?: TranslationKey;
  confirmPasswordError?: TranslationKey;
}

/** Both checks of a new password + confirm pair. */
export function validateNewPassword(
  password: string,
  confirmPassword: string,
): NewPasswordErrors {
  return {
    passwordError: validatePassword(password),
    confirmPasswordError: validatePasswordConfirmation(
      password,
      confirmPassword,
    ),
  };
}
