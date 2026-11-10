import type { CreateGroupDto, GroupDto, UpdateGroupDto } from "../../types";
import type { Database } from "../../types/database.types";
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
  updateMembershipRole,
} from "./groupMembershipService";

export async function createGroup(
  userId: string,
  payload: CreateGroupDto,
): Promise<GroupDto> {
  const name = payload.name.trim();
  if (!name) {
    throw new Error("Group name is required.");
  }

  const { data: currentUser, error: authError } = await supabase.auth.getUser();
  if (authError || !currentUser.user || currentUser.user.id !== userId) {
    throw new Error(authError?.message ?? "Not logged in as this user.");
  }
  const { data: group, error } = await supabase.rpc(
    "create_group_with_membership",
    {
      _name: name,
      _description: payload.description?.trim() || null,
      _group_icon_url: payload.groupIconUrl ?? null,
    },
  );

  if (error || !group) {
    throw new Error(error?.message ?? "Could not create group.");
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

export async function updateGroup(
  groupId: string,
  payload: UpdateGroupDto,
): Promise<GroupDto> {
  const updatePayload: Database["public"]["Tables"]["groups"]["Update"] = {};
  if (payload.name !== undefined) {
    const name = payload.name.trim();
    if (!name) {
      throw new Error("Group name is required.");
    }
    updatePayload.name = name;
  }
  if (payload.description !== undefined) {
    updatePayload.description = payload.description?.trim() || null;
  }
  if (payload.groupIconUrl !== undefined) {
    updatePayload.group_icon_url = payload.groupIconUrl;
  }
  if (Object.keys(updatePayload).length === 0) {
    throw new Error("At least one group field must be provided.");
  }

  const { data, error } = await supabase
    .from("groups")
    .update(updatePayload)
    .eq("id", groupId)
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Could not update group.");
  }

  return mapRowToGroupDto(data);
}

export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId)
    .select("id")
    .single();
  if (error) {
    throw new Error(error.message);
  }
}
