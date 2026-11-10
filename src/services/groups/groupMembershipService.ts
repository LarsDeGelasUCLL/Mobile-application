import type { GroupDto, MembershipDto } from "../../types";
import { mapRowToGroupDto, mapRowToMembershipDto } from "./groupMappers";
import { getUserProfileByEmail } from "../profiles/profileService";
import { supabase } from "../supabase";

export async function inviteUserByEmail(
  groupId: string,
  senderUserId: string,
  targetEmail: string,
): Promise<MembershipDto> {
  const targetProfile = await getUserProfileByEmail(targetEmail);
  if (!targetProfile) {
    throw new Error("No user found with this email address.");
  }

  const { data: existing } = await supabase
    .from("memberships")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", targetProfile.id)
    .maybeSingle();

  if (existing) {
    const message =
      existing.status === "ACTIVE"
        ? "This user is already a member of the group."
        : "This user already has a pending invitation.";
    throw new Error(message);
  }

  const { data: created, error } = await supabase
    .from("memberships")
    .insert({
      user_id: targetProfile.id,
      group_id: groupId,
      group_role: "MEMBER",
      status: "PENDING",
      invited_by: senderUserId,
    })
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Failed to send invitation.");
  }

  return mapRowToMembershipDto(created, targetProfile);
}

export async function joinGroupByInviteCode(
  userId: string,
  inviteCode: string,
): Promise<GroupDto> {
  const cleanCode = inviteCode.trim().toUpperCase();
  const { data: group, error } = await supabase
    .from("groups")
    .select("*")
    .eq("invite_code", cleanCode)
    .maybeSingle();

  if (error || !group) {
    throw new Error("Ongeldige invite-code.");
  }

  const { data: existing } = await supabase
    .from("memberships")
    .select("*")
    .eq("group_id", group.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "PENDING") {
      await supabase
        .from("memberships")
        .update({ status: "ACTIVE", joined_at: new Date().toISOString() })
        .eq("id", existing.id);
      return mapRowToGroupDto(group);
    }
    throw new Error("You are already a member of this group.");
  }

  const { error: insertError } = await supabase.from("memberships").insert({
    user_id: userId,
    group_id: group.id,
    group_role: "MEMBER",
    status: "ACTIVE",
  });

  if (insertError) {
    throw new Error(insertError.message);
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
    : await supabase.from("memberships").delete().eq("id", membershipId);

  if (response.error) {
    throw new Error(response.error.message);
  }
}

export async function removeMembership(membershipId: string): Promise<void> {
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);

  if (error) {
    throw new Error(error.message);
  }
}
