import { supabase } from "./supabase";
import type {
  GroupDto,
  CreateGroupDto,
  MembershipDto,
  UserGroupDto,
  GroupInviteDto,
  GroupRole,
  MembershipStatus,
  UserProfileDto,
} from "../types";
import {
  getUserProfileByEmail,
  mapRowToUserProfileDto,
} from "./profileService";

function parseGroupRole(value: unknown): GroupRole {
  return value === "ADMIN" ? "ADMIN" : "MEMBER";
}

function parseMembershipStatus(value: unknown): MembershipStatus {
  return value === "ACTIVE" ? "ACTIVE" : "PENDING";
}

export function mapRowToGroupDto(row: Record<string, unknown>): GroupDto {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    inviteCode: String(row.invite_code ?? ""),
    groupIconUrl:
      typeof row.group_icon_url === "string" ? row.group_icon_url : null,
    createdBy: typeof row.created_by === "string" ? row.created_by : null,
    recordCreated: String(row.record_created ?? ""),
  };
}

export function mapRowToMembershipDto(
  row: Record<string, unknown>,
  profile?: UserProfileDto,
): MembershipDto {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    groupId: String(row.group_id ?? ""),
    groupRole: parseGroupRole(row.group_role),
    status: parseMembershipStatus(row.status),
    invitedBy: typeof row.invited_by === "string" ? row.invited_by : null,
    joinedAt: String(row.joined_at ?? ""),
    userProfile: profile,
  };
}

// Endpoint 1: Create a group and immediately add its creator as an active admin
export async function createGroup(
  userId: string,
  payload: CreateGroupDto,
): Promise<GroupDto> {
  const cleanName = payload.name.trim();
  if (!cleanName) {
    throw new Error("Group name is required.");
  }

  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: cleanName,
      description: payload.description?.trim() ?? null,
      group_icon_url: payload.groupIconUrl ?? null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (groupError || !groupData) {
    throw new Error(groupError?.message ?? "Could not create group.");
  }

  const { error: memberError } = await supabase.from("memberships").insert({
    user_id: userId,
    group_id: groupData.id,
    group_role: "ADMIN",
    status: "ACTIVE",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  return mapRowToGroupDto(groupData);
}

// Endpoint 2: Get a specific group by ID
export async function getGroupById(groupId: string): Promise<GroupDto> {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Group not found.");
  }

  return mapRowToGroupDto(data);
}

// Endpoint 3: Get all active groups for a user
export async function getUserActiveGroups(
  userId: string,
): Promise<UserGroupDto[]> {
  const { data: memberships, error: memError } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "ACTIVE");

  if (memError) {
    throw new Error(memError.message);
  }
  if (!memberships || memberships.length === 0) {
    return [];
  }

  const groupIds = memberships.map((m) => String(m.group_id));
  const { data: groupsData, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);

  if (groupsError || !groupsData) {
    throw new Error(groupsError?.message ?? "Could not load groups.");
  }

  const result: UserGroupDto[] = [];
  for (const m of memberships) {
    const rawGroup = groupsData.find((g) => g.id === m.group_id);
    if (rawGroup) {
      result.push({
        membershipId: String(m.id),
        groupRole: parseGroupRole(m.group_role),
        joinedAt: String(m.joined_at ?? ""),
        group: mapRowToGroupDto(rawGroup),
      });
    }
  }

  return result;
}

// Endpoint 4: Get all members of a group, including their profiles
export async function getGroupMembers(
  groupId: string,
): Promise<MembershipDto[]> {
  const { data: memberships, error: memError } = await supabase
    .from("memberships")
    .select("*")
    .eq("group_id", groupId);

  if (memError) {
    throw new Error(memError.message);
  }
  if (!memberships || memberships.length === 0) {
    return [];
  }

  const userIds = memberships.map((m) => String(m.user_id));
  const { data: profilesData, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .in("id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  return memberships.map((m) => {
    const foundProfile = profilesData?.find((p) => p.id === m.user_id);
    const mappedProfile = foundProfile
      ? mapRowToUserProfileDto(foundProfile)
      : undefined;
    return mapRowToMembershipDto(m, mappedProfile);
  });
}

// Endpoint 5: Invite a user to a group by email address
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
    if (existing.status === "ACTIVE") {
      throw new Error("This user is already a member of the group.");
    }
    throw new Error("This user already has a pending invitation.");
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

// Endpoint 6: Join a group using a 6-digit invite code
export async function joinGroupByInviteCode(
  userId: string,
  inviteCode: string,
): Promise<GroupDto> {
  const cleanCode = inviteCode.trim().toUpperCase();
  const { data: groupRow, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("invite_code", cleanCode)
    .maybeSingle();

  if (groupError || !groupRow) {
    throw new Error("Ongeldige invite-code.");
  }

  const { data: existing } = await supabase
    .from("memberships")
    .select("*")
    .eq("group_id", groupRow.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "PENDING") {
      await supabase
        .from("memberships")
        .update({ status: "ACTIVE", joined_at: new Date().toISOString() })
        .eq("id", existing.id);
      return mapRowToGroupDto(groupRow);
    }
    throw new Error("You are already a member of this group.");
  }

  const { error: insertError } = await supabase.from("memberships").insert({
    user_id: userId,
    group_id: groupRow.id,
    group_role: "MEMBER",
    status: "ACTIVE",
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return mapRowToGroupDto(groupRow);
}

// Endpoint 7: Get all pending invitations (inbox) for a user
export async function getUserPendingInvites(
  userId: string,
): Promise<GroupInviteDto[]> {
  const { data: pendingRows, error: pendingError } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "PENDING");

  if (pendingError) {
    throw new Error(pendingError.message);
  }
  if (!pendingRows || pendingRows.length === 0) {
    return [];
  }

  const groupIds = pendingRows.map((r) => String(r.group_id));
  const inviterIds = pendingRows
    .map((r) => r.invited_by)
    .filter((id): id is string => typeof id === "string");

  const { data: groupsData } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);

  const { data: invitersData } =
    inviterIds.length > 0
      ? await supabase.from("user_profiles").select("*").in("id", inviterIds)
      : { data: [] };

  const invites: GroupInviteDto[] = [];
  for (const row of pendingRows) {
    const rawGroup = groupsData?.find((g) => g.id === row.group_id);
    const rawInviter = invitersData?.find((u) => u.id === row.invited_by);

    if (rawGroup) {
      invites.push({
        membershipId: String(row.id),
        joinedAt: String(row.joined_at ?? ""),
        group: mapRowToGroupDto(rawGroup),
        invitedByProfile: rawInviter
          ? mapRowToUserProfileDto(rawInviter)
          : null,
      });
    }
  }

  return invites;
}

// Endpoint 8: Accept or decline an invitation in the inbox
export async function respondToGroupInvite(
  membershipId: string,
  accept: boolean,
): Promise<void> {
  if (accept) {
    const { error } = await supabase
      .from("memberships")
      .update({ status: "ACTIVE", joined_at: new Date().toISOString() })
      .eq("id", membershipId);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("memberships")
      .delete()
      .eq("id", membershipId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

// Endpoint 9: Leave a group or remove a member
export async function removeMembership(membershipId: string): Promise<void> {
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("id", membershipId);

  if (error) {
    throw new Error(error.message);
  }
}
