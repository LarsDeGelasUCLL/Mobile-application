import type { GroupDto, MembershipDto } from "../../types";
import { mapRowToGroupDto, mapRowToMembershipDto } from "./groupMappers";
import { getPublicUserProfile } from "../profiles/profileService";
import { supabase } from "../supabase";

export async function inviteUserByEmail(
  groupId: string,
  senderUserId: string,
  targetEmail: string,
): Promise<MembershipDto> {
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser.user || currentUser.user.id !== senderUserId) {
    throw new Error(authError?.message ?? "Not logged in as this user.");
  }

  const { data: created, error } = await supabase.rpc("invite_user_by_email", {
    _group_id: groupId,
    _target_email: targetEmail.trim(),
  });

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to send invitation.");
  }

  const targetProfile = await getPublicUserProfile(created.user_id);
  return mapRowToMembershipDto(created, targetProfile);
}

export async function joinGroupByInviteCode(
  userId: string,
  inviteCode: string,
): Promise<GroupDto> {
  const cleanCode = inviteCode.trim().toUpperCase();
  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser.user || currentUser.user.id !== userId) {
    throw new Error(authError?.message ?? "Not logged in as this user.");
  }
  const { data: group, error } = await supabase.rpc(
    "join_group_by_invite_code",
    { _invite_code: cleanCode },
  );

  if (error || !group) {
    throw new Error(error?.message ?? "Invalid invite code.");
  }

  return mapRowToGroupDto(group);
}

export async function respondToGroupInvite(
  membershipId: string,
  accept: boolean,
): Promise<void> {
  const response = accept
    ? await supabase
        .from("memberships")
        .update({ status: "ACTIVE", joined_at: new Date().toISOString() })
        .eq("id", membershipId)
        .select("id")
        .single()
    : await supabase
        .from("memberships")
        .delete()
        .eq("id", membershipId)
        .select("id")
        .single();

  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function removeMembership(membershipId: string): Promise<void> {
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateMembershipRole(
  membershipId: string,
  groupRole: "ADMIN" | "MEMBER",
): Promise<MembershipDto> {
  const { data, error } = await supabase
    .from("memberships")
    .update({ group_role: groupRole })
    .eq("id", membershipId)
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Could not update member role.");
  }
  return mapRowToMembershipDto(data);
}
