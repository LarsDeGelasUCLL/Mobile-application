import type {
  UiTheme,
  UserProfileDto,
  UserSettingsDto,
} from "../../types";

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
