import type { StateCreator } from "zustand";
import type {
  CreateGroupDto,
  GroupDto,
  GroupInviteDto,
  GroupJoinRequestDto,
  MembershipDto,
  GroupRole,
  UpdateGroupDto,
  UserGroupDto,
} from "../../types";

export interface GroupState {
  // Groups the current user is an active member of.
  groups: UserGroupDto[];
  // Invites the current user has not answered yet.
  pendingInvites: GroupInviteDto[];
  // Active members of `selectedGroupId`.
  activeGroupMembers: MembershipDto[];
  // Open join requests of the group last loaded with fetchJoinRequestsForGroup (admin view).
  joinRequests: MembershipDto[];
  // Join requests the current user sent with an invite code.
  sentJoinRequests: GroupJoinRequestDto[];
  // Open join request count per group where the current user is ADMIN.
  joinRequestCounts: Record<string, number>;
  // The group whose members are loaded (the open group screen).
  selectedGroupId: string | null;
  isLoading: boolean;
  // Translated message of the last failure (or partial success).
  error: string | null;
  fetchGroupsAndInvites: (userId: string) => Promise<void>;
  fetchMembersForGroup: (groupId: string) => Promise<void>;
  createNewGroup: (
    userId: string,
    payload: CreateGroupDto,
  ) => Promise<GroupDto>;
  updateGroup: (groupId: string, payload: UpdateGroupDto) => Promise<GroupDto>;
  deleteGroup: (groupId: string, userId: string) => Promise<void>;
  changeMemberRole: (
    membershipId: string,
    groupRole: GroupRole,
  ) => Promise<void>;
  inviteMemberByEmail: (
    groupId: string,
    senderUserId: string,
    targetEmail: string,
  ) => Promise<void>;
  // `status` tells whether the user joined at once (they had an invite) or must wait for approval.
  joinByCode: (
    userId: string,
    inviteCode: string,
  ) => Promise<{ group: GroupDto; status: "ACTIVE" | "REQUESTED" }>;
  fetchJoinRequestsForGroup: (groupId: string) => Promise<void>;
  approveJoinRequest: (membershipId: string) => Promise<void>;
  rejectJoinRequest: (membershipId: string) => Promise<void>;
  cancelJoinRequest: (membershipId: string) => Promise<void>;
  respondToInvite: (
    userId: string,
    membershipId: string,
    accept: boolean,
  ) => Promise<void>;
  leaveOrRemoveMember: (
    userId: string,
    membershipId: string,
    groupId?: string,
  ) => Promise<void>;
  setSelectedGroupId: (groupId: string | null) => void;
  clearError: () => void;
  resetGroupStore: () => void;
}

/** Typed creator for one slice of the actions (`Keys`). */
export type GroupActionCreator<Keys extends keyof GroupState> = StateCreator<
  GroupState,
  [],
  [],
  Pick<GroupState, Keys>
>;
