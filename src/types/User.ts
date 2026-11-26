// SYSTEM follows the device setting.
export type UiTheme = "SYSTEM" | "LIGHT" | "DARK";

// The profile fields the app shows of other users (no contact or bank details).
export interface PublicUserProfileDto {
  id: string;
  displayName: string;
  profilePictureUrl: string | null;
  customBio: string | null;
  recordCreated: string;
}

// Response DTO: public.user_profiles. The full row; the app only loads it for the signed-in user.
export interface UserProfileDto extends PublicUserProfileDto {
  emailAddress: string;
  phoneNumber: string | null;
  iban: string | null;
}

// Request DTOs for the auth service (Supabase Auth)
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  displayName: string;
  phoneNumber?: string;
}

export interface PasswordResetRequestDto {
  email: string;
  redirectTo?: string; // where the reset link in the email leads
}

export interface SetPasswordRequestDto {
  password: string;
}

export interface ChangeEmailRequestDto {
  email: string;
  redirectTo?: string; // where the confirmation link in the email leads
}

export interface ResendConfirmationRequestDto {
  email: string;
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

// The signed-in user in useAuthStore: their own profile row.
export type User = UserProfileDto;
