// Supabase Auth calls. Each throws an `Error` with the Supabase message on failure;
// callers translate it with `errorMessage`.
import { getUserProfile } from "../profiles/profileService";
import { supabase } from "../supabase";
import type { Session } from "@supabase/supabase-js";
import type {
  ChangeEmailRequestDto,
  LoginRequestDto,
  PasswordResetRequestDto,
  RegisterRequestDto,
  ResendConfirmationRequestDto,
  SetPasswordRequestDto,
  User,
} from "../../types";

/** Thrown by `register` when the account must be confirmed by email before it can sign in. */
export class EmailConfirmationRequiredError extends Error {
  constructor(readonly email: string) {
    super("Registration succeeded. Check your email to confirm your account.");
    this.name = "EmailConfirmationRequiredError";
  }
}

/** Signs in with email and password and returns the user's profile. */
export async function login(payload: LoginRequestDto): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim(),
    password: payload.password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message ?? "Login failed");
  }

  return getUserProfile(data.user.id);
}

/**
 * Creates an account. The `handle_new_user` trigger builds the profile and
 * settings rows from the metadata below. Without a session (email
 * confirmation required) it throws `EmailConfirmationRequiredError`.
 */
export async function register(payload: RegisterRequestDto): Promise<User> {
  const cleanName = payload.displayName.trim();
  const { data, error } = await supabase.auth.signUp({
    email: payload.email.trim(),
    password: payload.password,
    options: {
      data: {
        display_name: cleanName,
        name: cleanName,
        phone_number: payload.phoneNumber?.trim() ?? null,
      },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Registration failed.");
  }
  if (!data.session) {
    throw new EmailConfirmationRequiredError(payload.email.trim());
  }

  return getUserProfile(data.user.id);
}

/**
 * The signed-in user's profile, or `null` when signed out. Pass a session
 * (from an auth event) to skip reading the stored one; `undefined` reads it.
 */
export async function getCurrentUser(
  session?: Session | null,
): Promise<User | null> {
  let currentSession = session;
  if (currentSession === undefined) {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    currentSession = data.session;
  }
  if (!currentSession?.user) {
    return null;
  }

  return getUserProfile(currentSession.user.id);
}

/** Emails a password reset link that leads to `redirectTo`. */
export async function requestPasswordReset(
  payload: PasswordResetRequestDto,
): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(
    payload.email.trim(),
    payload.redirectTo ? { redirectTo: payload.redirectTo } : undefined,
  );
  if (error) {
    throw new Error(error.message);
  }
}

/** Signs in with the PKCE `code` from an auth email link. */
export async function exchangeCodeForSession(code: string): Promise<void> {
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    throw new Error(error.message);
  }
}

/** Sets a new password for the signed-in user (after a reset link, or from Settings). */
export async function setPassword(
  payload: SetPasswordRequestDto,
): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: payload.password,
  });
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Starts an email change: Supabase mails a confirmation link, and the
 * `handle_user_email_change` trigger updates the profile once it is confirmed.
 */
export async function changeEmail(
  payload: ChangeEmailRequestDto,
): Promise<void> {
  const { error } = await supabase.auth.updateUser(
    { email: payload.email.trim() },
    payload.redirectTo ? { emailRedirectTo: payload.redirectTo } : undefined,
  );
  if (error) {
    throw new Error(error.message);
  }
}

/** Sends the signup confirmation email again. */
export async function resendConfirmation(
  payload: ResendConfirmationRequestDto,
): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: payload.email.trim(),
  });
  if (error) {
    throw new Error(error.message);
  }
}

/** Signs out. The auth store resets the other stores. */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
