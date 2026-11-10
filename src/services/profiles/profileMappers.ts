import type {
  UiTheme,
  PublicUserProfileDto,
  UserProfileDto,
  UserSettingsDto,
} from "../../types";
import type { Database } from "../../types/database.types";

function parseUiTheme(value: unknown): UiTheme {
  if (value === "LIGHT" || value === "DARK" || value === "SYSTEM") {
    return value;
  }
  return "SYSTEM";
}

export function mapRowToUserProfileDto(
  row: Database["public"]["Tables"]["user_profiles"]["Row"],
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

export function mapRowToPublicUserProfileDto(
  row: Pick<
    Database["public"]["Tables"]["user_profiles"]["Row"],
    "id" | "display_name" | "profile_picture_url" | "custom_bio" | "record_created"
  >,
): PublicUserProfileDto {
  return {
    id: row.id,
    displayName: row.display_name,
    profilePictureUrl: row.profile_picture_url,
    customBio: row.custom_bio,
    recordCreated: row.record_created,
  };
}

export function mapRowToUserSettingsDto(
  row: Database["public"]["Tables"]["user_settings"]["Row"],
): UserSettingsDto {
  return {
    userId: String(row.user_id ?? ""),
    pushNotificationToken:
      typeof row.push_notification_token === "string"
        ? row.push_notification_token
        : null,
    uiTheme: parseUiTheme(row.ui_theme),
    languageCode: row.language_code,
    notifyNewExpense: row.notify_new_expense,
    notifyReminders: row.notify_reminders,
    notifyGroupUpdates: row.notify_group_updates,
  };
}
