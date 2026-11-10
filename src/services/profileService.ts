import { supabase } from "./supabase";
import type {
  UserProfileDto,
  UpdateUserProfileDto,
  UserSettingsDto,
  UpdateUserSettingsDto,
  UiTheme,
} from "../types";

function parseUiTheme(value: unknown): UiTheme {
  if (value === "LIGHT" || value === "DARK" || value === "SYSTEM") {
    return value;
  }
  return "SYSTEM";
}

export function mapRowToUserProfileDto(
  row: Record<string, unknown>,
): UserProfileDto {
  return {
    id: String(row.id ?? ""),
    emailAddress: String(row.email_address ?? ""),
    displayName: String(row.display_name ?? ""),
    phoneNumber: typeof row.phone_number === "string" ? row.phone_number : null,
    iban: typeof row.iban === "string" ? row.iban : null,
    profilePictureUrl:
      typeof row.profile_picture_url === "string"
        ? row.profile_picture_url
        : null,
    customBio: typeof row.custom_bio === "string" ? row.custom_bio : null,
    recordCreated: String(row.record_created ?? ""),
  };
}

export function mapRowToUserSettingsDto(
  row: Record<string, unknown>,
): UserSettingsDto {
  return {
    userId: String(row.user_id ?? ""),
    pushNotificationToken:
      typeof row.push_notification_token === "string"
        ? row.push_notification_token
        : null,
    uiTheme: parseUiTheme(row.ui_theme),
    languageCode: String(row.language_code ?? "en"),
    notifyNewExpense: Boolean(row.notify_new_expense ?? true),
    notifyReminders: Boolean(row.notify_reminders ?? true),
    notifyGroupUpdates: Boolean(row.notify_group_updates ?? true),
  };
}

// Endpoint: Get user profile by user ID
export async function getUserProfile(userId: string): Promise<UserProfileDto> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Profile not found.");
  }

  return mapRowToUserProfileDto(data);
}

// Endpoint: Get user profile by email address
export async function getUserProfileByEmail(
  email: string,
): Promise<UserProfileDto | null> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .ilike("email_address", email.trim())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRowToUserProfileDto(data) : null;
}

// Endpoint: Update user profile by user ID (display name, phone number, IBAN, profile picture URL, custom bio)
export async function updateUserProfile(
  userId: string,
  payload: UpdateUserProfileDto,
): Promise<UserProfileDto> {
  const updatePayload: Record<string, unknown> = {};

  if (payload.displayName !== undefined) {
    updatePayload.display_name = payload.displayName.trim();
  }
  if (payload.phoneNumber !== undefined) {
    updatePayload.phone_number = payload.phoneNumber;
  }
  if (payload.iban !== undefined) {
    updatePayload.iban = payload.iban;
  }
  if (payload.profilePictureUrl !== undefined) {
    updatePayload.profile_picture_url = payload.profilePictureUrl;
  }
  if (payload.customBio !== undefined) {
    updatePayload.custom_bio = payload.customBio;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .update(updatePayload)
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update profile.");
  }

  // Synchronise the display name with Supabase Auth user metadata if it was updated
  if (payload.displayName !== undefined) {
    await supabase.auth.updateUser({
      data: {
        display_name: payload.displayName.trim(),
        name: payload.displayName.trim(),
      },
    });
  }

  return mapRowToUserProfileDto(data);
}

// Endpoint: Get user settings
export async function getUserSettings(
  userId: string,
): Promise<UserSettingsDto> {
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

// Endpoint: Update user settings
export async function updateUserSettings(
  userId: string,
  payload: UpdateUserSettingsDto,
): Promise<UserSettingsDto> {
  const updatePayload: Record<string, unknown> = {};

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
