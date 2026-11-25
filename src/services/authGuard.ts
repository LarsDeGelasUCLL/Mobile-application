import { supabase } from "./supabase";

/** Throws unless the signed-in Supabase user is `userId` (RLS is the real guard). */
export async function assertCurrentUser(userId: string): Promise<void> {
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser.user || currentUser.user.id !== userId) {
    throw new Error(authError?.message ?? "Not logged in as this user.");
  }
}
