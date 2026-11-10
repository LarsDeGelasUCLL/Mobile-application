import {
  createGroup,
  getUserActiveGroups,
  removeMembership,
} from "../../services";
import type { GroupActionCreator } from "./groupStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

export const createGroupManagementActions: GroupActionCreator<
  | "createNewGroup"
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
