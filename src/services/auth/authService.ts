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

export class EmailConfirmationRequiredError extends Error {
  constructor(readonly email: string) {
    super("Registration succeeded. Check your email to confirm your account.");
    this.name = "EmailConfirmationRequiredError";
  }
}

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

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
