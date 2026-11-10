import { getUserProfile, updateUserProfile } from "../profiles/profileService";
import { supabase } from "../supabase";
import type {
  ChangeEmailRequestDto,
  LoginRequestDto,
  PasswordResetRequestDto,
  RegisterRequestDto,
  ResendConfirmationRequestDto,
  SetPasswordRequestDto,
  User,
  UserProfileDto,
} from "../../types";

function buildAuthenticatedUser(profile: UserProfileDto, token: string): User {
  return {
    ...profile,
    token,
    email: profile.emailAddress,
    name: profile.displayName,
  };
}

export async function login(payload: LoginRequestDto): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email.trim(),
    password: payload.password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message ?? "Login failed");
  }

  const profile = await getUserProfile(data.user.id);
  return buildAuthenticatedUser(profile, data.session.access_token);
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
    throw new Error(
      "Registration succeeded, but Supabase did not return a session. Check the email confirmation settings.",
    );
  }

  const profile = await getUserProfile(data.user.id);
  return buildAuthenticatedUser(profile, data.session.access_token);
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  if (!data.session?.user) {
    return null;
  }

  const profile = await getUserProfile(data.session.user.id);
  return buildAuthenticatedUser(profile, data.session.access_token);
}

export async function updateProfileName(name: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error(userError?.message ?? "Not logged in.");
  }

  await updateUserProfile(userData.user.id, { displayName: name.trim() });
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
    payload.redirectTo
      ? { emailRedirectTo: payload.redirectTo }
      : undefined,
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
