import type {
  UpdateUserProfileDto,
  UserProfileDto,
} from "../../types";
import { mapRowToUserProfileDto } from "./profileMappers";
import { supabase } from "../supabase";

export {
  mapRowToUserProfileDto,
  mapRowToUserSettingsDto,
} from "./profileMappers";
export { getUserSettings, updateUserSettings } from "./settingsService";

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

  if (payload.displayName !== undefined) {
    const displayName = payload.displayName.trim();
    await supabase.auth.updateUser({
      data: { display_name: displayName, name: displayName },
    });
  }

  return mapRowToUserProfileDto(data);
}
