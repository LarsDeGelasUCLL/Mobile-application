import { supabase } from "./supabase";
import { getUserProfile, updateUserProfile } from "./profileService";
import type { User, UserProfileDto } from "../types";

function buildAuthenticatedUser(profile: UserProfileDto, token: string): User {
  return {
    ...profile,
    token,
    email: profile.emailAddress,
    name: profile.displayName,
  };
}

// Endpoint: Login a user with email and password, returning the authenticated user and token
export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message ?? "Login failed");
  }

  try {
    const profile = await getUserProfile(data.user.id);
    return buildAuthenticatedUser(profile, data.session.access_token);
  } catch {
    // Fall back if the user_profiles row does not exist yet
    const fallbackName = (data.user.email ?? email).split("@")[0];
    const metaName =
      data.user.user_metadata?.display_name ?? data.user.user_metadata?.name;
    const displayName = typeof metaName === "string" ? metaName : fallbackName;

    const fallbackProfile: UserProfileDto = {
      id: data.user.id,
      emailAddress: data.user.email ?? email,
      displayName,
      phoneNumber: data.user.phone ?? null,
      iban: null,
      profilePictureUrl: null,
      customBio: null,
      recordCreated: new Date().toISOString(),
    };

    return buildAuthenticatedUser(fallbackProfile, data.session.access_token);
  }
}

// Endpoint: Create a new user account with email, password, and display name
export async function register(
  email: string,
  password: string,
  displayName: string,
  phoneNumber?: string,
): Promise<User> {
  const cleanName = displayName.trim();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        display_name: cleanName,
        name: cleanName,
        phone_number: phoneNumber?.trim() ?? null,
      },
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Registration failed.");
  }

  const token = data.session?.access_token ?? "";
  const profile = await getUserProfile(data.user.id);
  return buildAuthenticatedUser(profile, token);
}

// Endpoint: Authenticate the current user session and retrieve the user profile
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    return null;
  }

  const profile = await getUserProfile(data.session.user.id);
  return buildAuthenticatedUser(profile, data.session.access_token);
}

// Endpoint: update the display name of the currently authenticated user
export async function updateProfileName(name: string): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error(userError?.message ?? "Not logged in.");
  }

  await updateUserProfile(userData.user.id, { displayName: name.trim() });
}

// Endpoint: Logout the currently authenticated user
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
