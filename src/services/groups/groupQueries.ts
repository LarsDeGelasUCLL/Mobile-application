import type {
  GroupInviteDto,
  GroupJoinRequestDto,
  MembershipDto,
  MembershipStatus,
  UserGroupDto,
} from "../../types";
import { mapRowToGroupDto, mapRowToMembershipDto } from "./groupMappers";
import { mapRowToPublicUserProfileDto } from "../profiles/profileMappers";
import { assertCurrentUser } from "../authGuard";
import { supabase } from "../supabase";

export async function getUserActiveGroups(
  userId: string,
): Promise<UserGroupDto[]> {
  await assertCurrentUser(userId);

  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "ACTIVE");

  if (membershipError) {
    throw new Error(membershipError.message);
  }
  if (!memberships?.length) return [];

  const groupIds = memberships.map((membership) => String(membership.group_id));
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);

  if (groupsError || !groups) {
    throw new Error(groupsError?.message ?? "Could not load groups.");
  }

  return memberships.flatMap((membership) => {
    const group = groups.find((item) => item.id === membership.group_id);
    return group
      ? [
          {
            membershipId: String(membership.id),
            groupRole: mapRowToMembershipDto(membership).groupRole,
            joinedAt: String(membership.joined_at ?? ""),
            group: mapRowToGroupDto(group),
          },
        ]
      : [];
  });
}

export function getGroupMembers(groupId: string): Promise<MembershipDto[]> {
  return getGroupMembershipsByStatus(groupId, "ACTIVE");
}

// RLS lets every active member read these rows; only admins can act on them.
export function getGroupJoinRequests(
  groupId: string,
): Promise<MembershipDto[]> {
  return getGroupMembershipsByStatus(groupId, "REQUESTED");
}

async function getGroupMembershipsByStatus(
  groupId: string,
  status: MembershipStatus,
): Promise<MembershipDto[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("group_id", groupId)
    .eq("status", status);

  if (membershipError) {
    throw new Error(membershipError.message);
  }
  if (!memberships?.length) return [];

  const userIds = memberships.map((membership) => String(membership.user_id));
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, display_name, profile_picture_url, custom_bio, record_created")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  return memberships.map((membership) => {
    const profileRow = profiles?.find(
      (profile) => profile.id === membership.user_id,
    );
    const profile = profileRow
      ? mapRowToPublicUserProfileDto(profileRow)
      : undefined;
    return mapRowToMembershipDto(membership, profile);
  });
}

export async function getUserPendingInvites(
  userId: string,
): Promise<GroupInviteDto[]> {
  await assertCurrentUser(userId);

  const { data: pendingRows, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "PENDING");

  if (error) {
    throw new Error(error.message);
  }
  if (!pendingRows?.length) return [];

  const groupIds = pendingRows.map((row) => String(row.group_id));
  const inviterIds = pendingRows
    .map((row) => row.invited_by)
    .filter((id): id is string => typeof id === "string");
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);
  if (groupsError) {
    throw new Error(groupsError.message);
  }
  const { data: inviters, error: invitersError } =
    inviterIds.length > 0
      ? await supabase
          .from("user_profiles")
          .select(
            "id, display_name, profile_picture_url, custom_bio, record_created",
          )
          .in("id", inviterIds)
      : { data: [], error: null };
  if (invitersError) {
    throw new Error(invitersError.message);
  }

  return pendingRows.flatMap((row) => {
    const group = groups?.find((item) => item.id === row.group_id);
    if (!group) return [];

    const inviter = inviters?.find((profile) => profile.id === row.invited_by);
    return [
      {
        membershipId: String(row.id),
        joinedAt: String(row.joined_at ?? ""),
        group: mapRowToGroupDto(group),
        invitedByProfile: inviter
          ? mapRowToPublicUserProfileDto(inviter)
          : null,
      },
    ];
  });
}

export async function getUserJoinRequests(
  userId: string,
): Promise<GroupJoinRequestDto[]> {
  await assertCurrentUser(userId);

  const { data: requestRows, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "REQUESTED");

  if (error) {
    throw new Error(error.message);
  }
  if (!requestRows?.length) return [];

  const groupIds = requestRows.map((row) => String(row.group_id));
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);
  if (groupsError) {
    throw new Error(groupsError.message);
  }

  return requestRows.flatMap((row) => {
    const group = groups?.find((item) => item.id === row.group_id);
    return group
      ? [
          {
            membershipId: String(row.id),
            // joined_at holds the request time until an admin approves it.
            requestedAt: String(row.joined_at ?? ""),
            group: mapRowToGroupDto(group),
          },
        ]
      : [];
  });
}

export async function getAdminJoinRequestCounts(
  adminGroupIds: string[],
): Promise<Record<string, number>> {
  if (adminGroupIds.length === 0) return {};

  const { data: requestRows, error } = await supabase
    .from("memberships")
    .select("group_id")
    .eq("status", "REQUESTED")
    .in("group_id", adminGroupIds);

  if (error) {
    throw new Error(error.message);
  }

  const counts: Record<string, number> = {};
  for (const row of requestRows ?? []) {
    const groupId = String(row.group_id);
    counts[groupId] = (counts[groupId] ?? 0) + 1;
  }
  return counts;
}
