import { create } from "zustand";
import {
  createGroup,
  getUserActiveGroups,
  getGroupMembers,
  inviteUserByEmail,
  joinGroupByInviteCode,
  getUserPendingInvites,
  respondToGroupInvite,
  removeMembership,
} from "../services";
import type {
  GroupDto,
  CreateGroupDto,
  MembershipDto,
  UserGroupDto,
  GroupInviteDto,
} from "../types";

interface GroupState {
  groups: UserGroupDto[];
  pendingInvites: GroupInviteDto[];
  activeGroupMembers: MembershipDto[];
  selectedGroupId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchGroupsAndInvites: (userId: string) => Promise<void>;
  fetchMembersForGroup: (groupId: string) => Promise<void>;
  createNewGroup: (
    userId: string,
    payload: CreateGroupDto,
  ) => Promise<GroupDto>;
  inviteMemberByEmail: (
    groupId: string,
    senderUserId: string,
    targetEmail: string,
  ) => Promise<void>;
  joinByCode: (userId: string, inviteCode: string) => Promise<GroupDto>;
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

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  pendingInvites: [],
  activeGroupMembers: [],
  selectedGroupId: null,
  isLoading: false,
  error: null,

  fetchGroupsAndInvites: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const [groups, pendingInvites] = await Promise.all([
        getUserActiveGroups(userId),
        getUserPendingInvites(userId),
      ]);
      set({ groups, pendingInvites, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not load groups and inbox.",
      );
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchMembersForGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const members = await getGroupMembers(groupId);
      set({
        activeGroupMembers: members,
        selectedGroupId: groupId,
        isLoading: false,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Could not load group members.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createNewGroup: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const createdGroup = await createGroup(userId, payload);
      // Refresh the group list so the new group appears everywhere
      const updatedGroups = await getUserActiveGroups(userId);
      set({ groups: updatedGroups, isLoading: false });
      return createdGroup;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create group.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  inviteMemberByEmail: async (groupId, senderUserId, targetEmail) => {
    set({ isLoading: true, error: null });
    try {
      const newMembership = await inviteUserByEmail(
        groupId,
        senderUserId,
        targetEmail,
      );
      // Add the pending invitation to the list if this group's members are being viewed
      if (get().selectedGroupId === groupId) {
        set({
          activeGroupMembers: [...get().activeGroupMembers, newMembership],
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      const message = getErrorMessage(error, "Failed to send invitation.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  joinByCode: async (userId, inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const joinedGroup = await joinGroupByInviteCode(userId, inviteCode);
      const [groups, pendingInvites] = await Promise.all([
        getUserActiveGroups(userId),
        getUserPendingInvites(userId),
      ]);
      set({ groups, pendingInvites, isLoading: false });
      return joinedGroup;
    } catch (error) {
      const message = getErrorMessage(error, "Failed to join group with invite code.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  respondToInvite: async (userId, membershipId, accept) => {
    set({ isLoading: true, error: null });
    try {
      await respondToGroupInvite(membershipId, accept);
      const [groups, pendingInvites] = await Promise.all([
        getUserActiveGroups(userId),
        getUserPendingInvites(userId),
      ]);
      set({ groups, pendingInvites, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(error, "Could not process invitation.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  leaveOrRemoveMember: async (userId, membershipId, groupId) => {
    set({ isLoading: true, error: null });
    try {
      await removeMembership(membershipId);
      const updatedGroups = await getUserActiveGroups(userId);
      const updatedMembers =
        groupId !== undefined
          ? get().activeGroupMembers.filter((m) => m.id !== membershipId)
          : get().activeGroupMembers;

      set({
        groups: updatedGroups,
        activeGroupMembers: updatedMembers,
        isLoading: false,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not remove membership.",
      );
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setSelectedGroupId: (groupId) => {
    set({ selectedGroupId: groupId });
  },

  clearError: () => {
    set({ error: null });
  },

  resetGroupStore: () => {
    set({
      groups: [],
      pendingInvites: [],
      activeGroupMembers: [],
      selectedGroupId: null,
      isLoading: false,
      error: null,
    });
  },
}));
