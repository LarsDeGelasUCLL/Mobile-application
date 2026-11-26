import type {
  PublicUserProfileDto,
  UpdateUserProfileDto,
  UserProfileDto,
} from "../../types";
import type { Json } from "../../types/database.types";
import {
  mapRowToPublicUserProfileDto,
  mapRowToUserProfileDto,
} from "./profileMappers";
import { supabase } from "../supabase";

/**
 * Thrown by `updateUserProfile` when the profile row was saved but the
 * display name could not be copied to the Supabase Auth metadata.
 * `profile` holds the saved profile, so the caller can still show it.
 */
export class ProfileUpdatePartialSuccessError extends Error {
  constructor(
    readonly profile: UserProfileDto,
    readonly authError: Error,
  ) {
    super(
      `Profile data was updated, but Auth metadata update failed: ${authError.message}`,
    );
    this.name = "ProfileUpdatePartialSuccessError";
  }
}

// Re-exported so the rest of the app imports profile code from one place.
export {
  mapRowToPublicUserProfileDto,
  mapRowToUserProfileDto,
  mapRowToUserSettingsDto,
} from "./profileMappers";
export { getUserSettings, updateUserSettings } from "./settingsService";

/** The signed-in user's full profile; throws when `userId` is someone else. */
export async function getUserProfile(userId: string): Promise<UserProfileDto> {
  const { data, error } = await supabase.rpc("get_my_user_profile");

  if (error || !data) {
    throw new Error(error?.message ?? "Profile not found.");
  }
  if (data.id !== userId) {
    throw new Error("Cannot access another user's private profile.");
  }

  return mapRowToUserProfileDto(data);
}

/** Another user's public profile fields. */
export async function getPublicUserProfile(
  userId: string,
): Promise<PublicUserProfileDto> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, display_name, profile_picture_url, custom_bio, record_created")
    .eq("id", userId)
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Profile not found.");
  }
  return mapRowToPublicUserProfileDto(data);
}

/**
 * Updates only the fields present in `payload` (`undefined` = leave as is,
 * `null` = clear). A new display name is also written to the Auth metadata.
 */
export async function updateUserProfile(
  userId: string,
  payload: UpdateUserProfileDto,
): Promise<UserProfileDto> {
  // The RPC takes camelCase keys and only changes the keys it receives.
  const updatePayload: Json = {
    ...(payload.displayName !== undefined
      ? { displayName: payload.displayName.trim() }
      : {}),
    ...(payload.phoneNumber !== undefined
      ? { phoneNumber: payload.phoneNumber }
      : {}),
    ...(payload.iban !== undefined ? { iban: payload.iban } : {}),
    ...(payload.profilePictureUrl !== undefined
      ? { profilePictureUrl: payload.profilePictureUrl }
      : {}),
    ...(payload.customBio !== undefined
      ? { customBio: payload.customBio }
      : {}),
  };
  const { data, error } = await supabase.rpc("update_my_user_profile", {
    _payload: updatePayload,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update profile.");
  }
  if (data.id !== userId) {
    throw new Error("Cannot update another user's profile.");
  }
  if (payload.displayName !== undefined) {
    const displayName = payload.displayName.trim();
    const { error: authError } = await supabase.auth.updateUser({
      data: { display_name: displayName, name: displayName },
    });
    if (authError) {
      throw new ProfileUpdatePartialSuccessError(
        mapRowToUserProfileDto(data),
        new Error(authError.message),
      );
    }
  }

  return mapRowToUserProfileDto(data);
}
