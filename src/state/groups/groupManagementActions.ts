import {
  createGroup,
  deleteGroup,
  getUserActiveGroups,
  removeMembership,
  updateGroup,
  updateMembershipRole,
} from "../../services";
import type { GroupActionCreator } from "./groupStoreTypes";
import { errorMessage } from "../../i18n";

// Create, edit and delete groups, member roles and leaving, plus store housekeeping.
// Each async action sets a translated `error` and rethrows on failure.
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
      // Reload so the list has the new membership row too.
      const groups = await getUserActiveGroups(userId);
      set({ groups, isLoading: false });
      return createdGroup;
    } catch (error) {
      set({
        error: errorMessage(error, "errors.fallback.createGroup"),
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
        error: errorMessage(error, "errors.fallback.updateGroup"),
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
      // Forget the deleted group if it was the open one.
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
        error: errorMessage(error, "errors.fallback.deleteGroup"),
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
      // Update the role in the member list and, if it is the user's own, in their groups.
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
        error: errorMessage(error, "errors.fallback.changeRole"),
        isLoading: false,
      });
      throw error;
    }
  },

  // Leave a group or remove a member. With `groupId`, the membership is also
  // dropped from the loaded member list.
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
        error: errorMessage(error, "errors.fallback.removeMembership"),
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),

  clearError: () => set({ error: null }),

  // On logout.
  resetGroupStore: () =>
    set({
      groups: [],
      pendingInvites: [],
      activeGroupMembers: [],
      joinRequests: [],
      sentJoinRequests: [],
      joinRequestCounts: {},
      selectedGroupId: null,
      isLoading: false,
      error: null,
    }),
});
