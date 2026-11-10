export type UiTheme = "SYSTEM" | "LIGHT" | "DARK";

export interface PublicUserProfileDto {
  id: string;
  displayName: string;
  profilePictureUrl: string | null;
  customBio: string | null;
  recordCreated: string;
}

// Response DTO: public.user_profiles
export interface UserProfileDto extends PublicUserProfileDto {
  emailAddress: string;
  phoneNumber: string | null;
  iban: string | null;
}

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
  redirectTo?: string;
}

export interface SetPasswordRequestDto {
  password: string;
}

export interface ChangeEmailRequestDto {
  email: string;
  redirectTo?: string;
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

// combined User object for useAuthStore
export interface User extends UserProfileDto {
  token: string;
  // Backwards-compatible fields for existing boilerplate screens:
  email: string;
  name: string;
}
