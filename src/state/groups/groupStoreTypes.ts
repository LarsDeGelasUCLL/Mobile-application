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
  groups: UserGroupDto[];
  pendingInvites: GroupInviteDto[];
  activeGroupMembers: MembershipDto[];
  // Open join requests of the group last loaded with fetchJoinRequestsForGroup (admin view).
  joinRequests: MembershipDto[];
  // Join requests the current user sent with an invite code.
  sentJoinRequests: GroupJoinRequestDto[];
  // Open join request count per group where the current user is ADMIN.
  joinRequestCounts: Record<string, number>;
  selectedGroupId: string | null;
  isLoading: boolean;
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

export type GroupActionCreator<Keys extends keyof GroupState> = StateCreator<
  GroupState,
  [],
  [],
  Pick<GroupState, Keys>
>;
