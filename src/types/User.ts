export type UiTheme = "SYSTEM" | "LIGHT" | "DARK";

// Response DTO: public.user_profiles
export interface UserProfileDto {
  id: string;
  emailAddress: string;
  displayName: string;
  phoneNumber: string | null;
  iban: string | null;
  profilePictureUrl: string | null;
  customBio: string | null;
  recordCreated: string;
}

// Request DTO: update profile
export interface UpdateUserProfileDto {
  displayName?: string;
  phoneNumber?: string | null;
  iban?: string | null;
  profilePictureUrl?: string | null;
  customBio?: string | null;
}

// Response DTO: public.user_settings
export interface UserSettingsDto {
  userId: string;
  pushNotificationToken: string | null;
  uiTheme: UiTheme;
  languageCode: string;
  notifyNewExpense: boolean;
  notifyReminders: boolean;
  notifyGroupUpdates: boolean;
}

// Request DTO: update settings
export interface UpdateUserSettingsDto {
  pushNotificationToken?: string | null;
  uiTheme?: UiTheme;
  languageCode?: string;
  notifyNewExpense?: boolean;
  notifyReminders?: boolean;
  notifyGroupUpdates?: boolean;
}

// combined User object for useAuthStore
export interface User extends UserProfileDto {
  token: string;
  // Backwards-compatible fields for existing boilerplate screens:
  email: string;
  name: string;
}
