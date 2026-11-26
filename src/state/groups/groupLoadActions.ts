import {
  getAdminJoinRequestCounts,
  getGroupMembers,
  getUserActiveGroups,
  getUserJoinRequests,
  getUserPendingInvites,
} from "../../services";
import type { GroupActionCreator } from "./groupStoreTypes";
import { errorMessage, t } from "../../i18n";

// Loaders for the groups tab and a group's member list.
export const createGroupLoadActions: GroupActionCreator<
  "fetchGroupsAndInvites" | "fetchMembersForGroup"
> = (set, get) => ({
  fetchGroupsAndInvites: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const [groups, pendingInvites] = await Promise.all([
        getUserActiveGroups(userId),
        getUserPendingInvites(userId),
      ]);
      set({ groups, pendingInvites });
    } catch (error) {
      set({
        error: errorMessage(error, "errors.fallback.loadGroups"),
        isLoading: false,
      });
      throw error;
    }

    // Join request data is secondary: a failure keeps the old values and must not hide the groups.
    try {
      const [sentJoinRequests, joinRequestCounts] = await Promise.all([
        getUserJoinRequests(userId),
        getAdminJoinRequestCounts(
          get()
            .groups.filter((item) => item.groupRole === "ADMIN")
            .map((item) => item.group.id),
        ),
      ]);
      set({ sentJoinRequests, joinRequestCounts, isLoading: false });
    } catch (error) {
      set({
        error: t("errors.partial.joinRequestsNotLoaded", {
          reason: errorMessage(error, "errors.fallback.pleaseRetry"),
        }),
        isLoading: false,
      });
    }
  },

  fetchMembersForGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const activeGroupMembers = await getGroupMembers(groupId);
      set({ activeGroupMembers, selectedGroupId: groupId, isLoading: false });
    } catch (error) {
      set({
        error: errorMessage(error, "errors.fallback.loadMembers"),
        isLoading: false,
      });
      throw error;
    }
  },
});
