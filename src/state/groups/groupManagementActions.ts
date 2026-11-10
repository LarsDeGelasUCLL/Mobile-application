import {
  createGroup,
  deleteGroup,
  getUserActiveGroups,
  removeMembership,
  updateGroup,
  updateMembershipRole,
} from "../../services";
import type { GroupActionCreator } from "./groupStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

export const createGroupManagementActions: GroupActionCreator<
  | "createNewGroup"
  | "updateGroup"
  | "deleteGroup"
  | "changeMemberRole"
  | "leaveOrRemoveMember"
  | "setSelectedGroupId"
  | "clearError"
  | "resetGroupStore"
> = (set, get) => ({
  createNewGroup: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const createdGroup = await createGroup(userId, payload);
      const groups = await getUserActiveGroups(userId);
      set({ groups, isLoading: false });
      return createdGroup;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to create group."),
        isLoading: false,
      });
      throw error;
    }
  },

  updateGroup: async (groupId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedGroup = await updateGroup(groupId, payload);
      set({
        groups: get().groups.map((item) =>
          item.group.id === groupId ? { ...item, group: updatedGroup } : item,
        ),
        isLoading: false,
      });
      return updatedGroup;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not update group."),
        isLoading: false,
      });
      throw error;
    }
  },

  deleteGroup: async (groupId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteGroup(groupId);
      const groups = await getUserActiveGroups(userId);
      const selectedGroupId =
        get().selectedGroupId === groupId ? null : get().selectedGroupId;
      set({
        groups,
        selectedGroupId,
        activeGroupMembers:
          selectedGroupId === null ? [] : get().activeGroupMembers,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not delete group."),
        isLoading: false,
      });
      throw error;
    }
  },

  changeMemberRole: async (membershipId, groupRole) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMembership = await updateMembershipRole(
        membershipId,
        groupRole,
      );
      set({
        activeGroupMembers: get().activeGroupMembers.map((membership) =>
          membership.id === membershipId
            ? { ...membership, groupRole: updatedMembership.groupRole }
            : membership,
        ),
        groups: get().groups.map((item) =>
          item.membershipId === membershipId
            ? { ...item, groupRole: updatedMembership.groupRole }
            : item,
        ),
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not change member role."),
        isLoading: false,
      });
      throw error;
    }
  },

  leaveOrRemoveMember: async (userId, membershipId, groupId) => {
    set({ isLoading: true, error: null });
    try {
      await removeMembership(membershipId);
      const groups = await getUserActiveGroups(userId);
      const activeGroupMembers =
        groupId !== undefined
          ? get().activeGroupMembers.filter(
              (membership) => membership.id !== membershipId,
            )
          : get().activeGroupMembers;
      set({ groups, activeGroupMembers, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not remove membership."),
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),

  clearError: () => set({ error: null }),

  resetGroupStore: () =>
    set({
      groups: [],
      pendingInvites: [],
      activeGroupMembers: [],
      selectedGroupId: null,
      isLoading: false,
      error: null,
    }),
});
