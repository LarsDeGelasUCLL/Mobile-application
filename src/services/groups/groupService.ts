import type { CreateGroupDto, GroupDto } from "../../types";
import { mapRowToGroupDto } from "./groupMappers";
import { supabase } from "../supabase";

export { mapRowToGroupDto, mapRowToMembershipDto } from "./groupMappers";
export {
  getGroupMembers,
  getUserActiveGroups,
  getUserPendingInvites,
} from "./groupQueries";
export {
  inviteUserByEmail,
  joinGroupByInviteCode,
  removeMembership,
  respondToGroupInvite,
} from "./groupMembershipService";

export async function createGroup(
  userId: string,
  payload: CreateGroupDto,
): Promise<GroupDto> {
  const name = payload.name.trim();
  if (!name) {
    throw new Error("Group name is required.");
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      name,
      description: payload.description?.trim() ?? null,
      group_icon_url: payload.groupIconUrl ?? null,
      created_by: userId,
    })
    .select("*")
    .single();

  if (error || !group) {
    throw new Error(error?.message ?? "Could not create group.");
  }

  const { error: membershipError } = await supabase.from("memberships").insert({
    user_id: userId,
    group_id: group.id,
    group_role: "ADMIN",
    status: "ACTIVE",
  });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  return mapRowToGroupDto(group);
}

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
