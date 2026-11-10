import {
  getUserActiveGroups,
  getUserPendingInvites,
  inviteUserByEmail,
  joinGroupByInviteCode,
  respondToGroupInvite,
} from "../../services";
import type { GroupActionCreator } from "./groupStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

export const createGroupInviteActions: GroupActionCreator<
  "inviteMemberByEmail" | "joinByCode" | "respondToInvite"
> = (set, get) => ({
  inviteMemberByEmail: async (groupId, senderUserId, targetEmail) => {
    set({ isLoading: true, error: null });
    try {
      const membership = await inviteUserByEmail(
        groupId,
        senderUserId,
        targetEmail,
      );
      if (get().selectedGroupId === groupId) {
        set({
          activeGroupMembers: [...get().activeGroupMembers, membership],
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to send invitation."),
        isLoading: false,
      });
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
      set({
        error: getErrorMessage(error, "Failed to join group with invite code."),
        isLoading: false,
      });
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
      set({
        error: getErrorMessage(error, "Could not process invitation."),
        isLoading: false,
      });
      throw error;
    }
  },
});
