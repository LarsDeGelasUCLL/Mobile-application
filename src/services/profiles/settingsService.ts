import type { UpdateUserSettingsDto, UserSettingsDto } from "../../types";
import type { Database } from "../../types/database.types";
import { mapRowToUserSettingsDto } from "./profileMappers";
import { supabase } from "../supabase";

export async function getUserSettings(
  userId: string,
): Promise<UserSettingsDto> {
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser.user || currentUser.user.id !== userId) {
    throw new Error(authError?.message ?? "Not logged in as this user.");
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Settings not found.");
  }

  return mapRowToUserSettingsDto(data);
}

export async function updateUserSettings(
  userId: string,
  payload: UpdateUserSettingsDto,
): Promise<UserSettingsDto> {
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser.user || currentUser.user.id !== userId) {
    throw new Error(authError?.message ?? "Not logged in as this user.");
  }

  const updatePayload: Database["public"]["Tables"]["user_settings"]["Update"] =
    {};

  if (payload.pushNotificationToken !== undefined) {
    updatePayload.push_notification_token = payload.pushNotificationToken;
  }
  if (payload.uiTheme !== undefined) {
    updatePayload.ui_theme = payload.uiTheme;
  }
  if (payload.languageCode !== undefined) {
    updatePayload.language_code = payload.languageCode;
  }
  if (payload.notifyNewExpense !== undefined) {
    updatePayload.notify_new_expense = payload.notifyNewExpense;
  }
  if (payload.notifyReminders !== undefined) {
    updatePayload.notify_reminders = payload.notifyReminders;
  }
  if (payload.notifyGroupUpdates !== undefined) {
    updatePayload.notify_group_updates = payload.notifyGroupUpdates;
  }

  const { data, error } = await supabase
    .from("user_settings")
    .update(updatePayload)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update settings.");
  }

  return mapRowToUserSettingsDto(data);
}
