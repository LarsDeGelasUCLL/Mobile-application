import {
  getAdminJoinRequestCounts,
  getGroupMembers,
  getUserActiveGroups,
  getUserJoinRequests,
  getUserPendingInvites,
} from "../../services";
import type { GroupActionCreator } from "./groupStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

export const createGroupLoadActions: GroupActionCreator<
  "fetchGroupsAndInvites" | "fetchMembersForGroup"
> = (set) => ({
  fetchGroupsAndInvites: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const [groups, pendingInvites, sentJoinRequests] = await Promise.all([
        getUserActiveGroups(userId),
        getUserPendingInvites(userId),
        getUserJoinRequests(userId),
      ]);
      const joinRequestCounts = await getAdminJoinRequestCounts(
        groups
          .filter((item) => item.groupRole === "ADMIN")
          .map((item) => item.group.id),
      );
      set({
        groups,
        pendingInvites,
        sentJoinRequests,
        joinRequestCounts,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not load groups and inbox."),
        isLoading: false,
      });
      throw error;
    }
  },

  fetchMembersForGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const activeGroupMembers = await getGroupMembers(groupId);
      set({ activeGroupMembers, selectedGroupId: groupId, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not load group members."),
        isLoading: false,
      });
      throw error;
    }
  },
});
