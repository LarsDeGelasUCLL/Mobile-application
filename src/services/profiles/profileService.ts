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

export {
  mapRowToPublicUserProfileDto,
  mapRowToUserProfileDto,
  mapRowToUserSettingsDto,
} from "./profileMappers";
export { getUserSettings, updateUserSettings } from "./settingsService";

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

export async function updateUserProfile(
  userId: string,
  payload: UpdateUserProfileDto,
): Promise<UserProfileDto> {
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
    ...(payload.customBio !== undefined ? { customBio: payload.customBio } : {}),
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
      throw new Error(authError.message);
    }
  }

  return mapRowToUserProfileDto(data);
}
