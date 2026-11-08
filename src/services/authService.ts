import { supabase } from "./supabase";
import type { User } from "../types/User";

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message ?? "Login failed");
  }

  const fallbackName = (data.user.email ?? email).split("@")[0];
  const metadataName = data.user.user_metadata?.name;
  const displayName =
    typeof metadataName === "string" ? metadataName : fallbackName;

  const loggedInUser: User = {
    id: data.user.id,
    email: data.user.email ?? email,
    name: displayName,
    token: data.session.access_token,
  };

  return loggedInUser;
}

export async function updateProfileName(name: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: { name: name.trim() },
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
