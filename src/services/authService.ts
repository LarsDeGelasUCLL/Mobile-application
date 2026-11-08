import { supabase } from "./supabase";
import { User } from "../types";

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Login failed");
  }

  const fallbackName = (data.user.email ?? email).split("@")[0];
  const displayName = data.user.user_metadata?.name || fallbackName;

  return {
    id: data.user.id,
    email: data.user.email ?? email,
    name: displayName,
  } as User;
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
