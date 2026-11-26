// Invites, join requests and membership changes. Permissions are enforced by
// RLS, the RPCs and the `protect_membership_mutations` trigger.
import type { GroupDto, MembershipDto } from "../../types";
import { mapRowToGroupDto, mapRowToMembershipDto } from "./groupMappers";
import { getPublicUserProfile } from "../profiles/profileService";
import { assertCurrentUser } from "../authGuard";
import { supabase } from "../supabase";

/**
 * Admin invites an existing account by email (a PENDING membership). If that
 * person already asked to join, the invite approves their request instead.
 */
export async function inviteUserByEmail(
  groupId: string,
  senderUserId: string,
  targetEmail: string,
): Promise<MembershipDto> {
  await assertCurrentUser(senderUserId);

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

/**
 * Asks to join the group with this invite code (a REQUESTED membership), or
 * accepts an open invite to it. Codes are stored upper case.
 */
export async function joinGroupByInviteCode(
  userId: string,
  inviteCode: string,
): Promise<GroupDto> {
  const cleanCode = inviteCode.trim().toUpperCase();
  await assertCurrentUser(userId);
  const { data: group, error } = await supabase.rpc(
    "join_group_by_invite_code",
    { _invite_code: cleanCode },
  );

  if (error || !group) {
    throw new Error(error?.message ?? "Invalid invite code.");
  }

  return mapRowToGroupDto(group);
}

/**
 * Admin approves a join request (REQUESTED becomes ACTIVE). Rejecting (admin)
 * or cancelling (requester) a request uses `removeMembership`.
 */
export async function approveJoinRequest(
  membershipId: string,
): Promise<MembershipDto> {
  const { data: approved, error } = await supabase.rpc("approve_join_request", {
    _membership_id: membershipId,
  });

  if (error || !approved) {
    throw new Error(error?.message ?? "Could not approve join request.");
  }

  const requesterProfile = await getPublicUserProfile(approved.user_id);
  return mapRowToMembershipDto(approved, requesterProfile);
}

/** Accepts (becomes ACTIVE) or declines (row deleted) the user's own invite. */
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

  // `.select().single()` makes a call that matched no row (e.g. blocked by RLS) fail instead of silently doing nothing.
  if (response.error) {
    throw new Error(response.error.message);
  }
}

/** Deletes a membership: leave, remove a member, reject or cancel a join request. */
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

/** Admin promotes or demotes a member. */
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
