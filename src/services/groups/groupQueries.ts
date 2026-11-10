import type {
  GroupInviteDto,
  MembershipDto,
  UserGroupDto,
} from "../../types";
import { mapRowToGroupDto, mapRowToMembershipDto } from "./groupMappers";
import { mapRowToUserProfileDto } from "../profiles/profileMappers";
import { supabase } from "../supabase";

export async function getUserActiveGroups(
  userId: string,
): Promise<UserGroupDto[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "ACTIVE");

  if (membershipError) {
    throw new Error(membershipError.message);
  }
  if (!memberships?.length) return [];

  const groupIds = memberships.map((membership) =>
    String(membership.group_id),
  );
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
      ? [{
          membershipId: String(membership.id),
          groupRole:
            membership.group_role === "ADMIN" ? "ADMIN" : "MEMBER",
          joinedAt: String(membership.joined_at ?? ""),
          group: mapRowToGroupDto(group),
        }]
      : [];
  });
}

export async function getGroupMembers(
  groupId: string,
): Promise<MembershipDto[]> {
  const { data: memberships, error: membershipError } = await supabase
    .from("memberships")
    .select("*")
    .eq("group_id", groupId);

  if (membershipError) {
    throw new Error(membershipError.message);
  }
  if (!memberships?.length) return [];

  const userIds = memberships.map((membership) => String(membership.user_id));
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  return memberships.map((membership) => {
    const profileRow = profiles?.find(
      (profile) => profile.id === membership.user_id,
    );
    const profile = profileRow
      ? mapRowToUserProfileDto(profileRow)
      : undefined;
    return mapRowToMembershipDto(membership, profile);
  });
}

export async function getUserPendingInvites(
  userId: string,
): Promise<GroupInviteDto[]> {
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
  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);
  const { data: inviters } =
    inviterIds.length > 0
      ? await supabase.from("user_profiles").select("*").in("id", inviterIds)
      : { data: [] };

  return pendingRows.flatMap((row) => {
    const group = groups?.find((item) => item.id === row.group_id);
    if (!group) return [];

    const inviter = inviters?.find((profile) => profile.id === row.invited_by);
    return [{
      membershipId: String(row.id),
      joinedAt: String(row.joined_at ?? ""),
      group: mapRowToGroupDto(group),
      invitedByProfile: inviter ? mapRowToUserProfileDto(inviter) : null,
    }];
  });
}
