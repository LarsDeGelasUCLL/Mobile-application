import {
  getUserActiveGroups,
  getUserJoinRequests,
  getUserPendingInvites,
  inviteUserByEmail,
  joinGroupByInviteCode,
  respondToGroupInvite,
} from "../../services";
import { withoutJoinRequest } from "./groupJoinRequestActions";
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
      // ACTIVE here means the invitee had an open join request: the invite approved it.
      if (membership.status === "ACTIVE") {
        set(withoutJoinRequest(get(), membership.id, groupId));
      }
      if (membership.status === "ACTIVE" && get().selectedGroupId === groupId) {
        set({
          activeGroupMembers: [...get().activeGroupMembers, membership],
          isLoading: false,
        });
        return;
      }
      set({ isLoading: false });
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
      const group = await joinGroupByInviteCode(userId, inviteCode);
      const [groups, pendingInvites, sentJoinRequests] = await Promise.all([
        getUserActiveGroups(userId),
        getUserPendingInvites(userId),
        getUserJoinRequests(userId),
      ]);
      set({ groups, pendingInvites, sentJoinRequests, isLoading: false });
      // The RPC returns the group either way; an email invite makes the join instant.
      const status = groups.some((item) => item.group.id === group.id)
        ? ("ACTIVE" as const)
        : ("REQUESTED" as const);
      return { group, status };
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
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not process invitation."),
        isLoading: false,
      });
      throw error;
    }

    const invite = get().pendingInvites.find(
      (item) => item.membershipId === membershipId,
    );
    set({
      pendingInvites: get().pendingInvites.filter(
        (item) => item.membershipId !== membershipId,
      ),
      ...(accept && invite
        ? {
            groups: [
              ...get().groups.filter(
                (item) => item.group.id !== invite.group.id,
              ),
              {
                membershipId,
                groupRole: "MEMBER" as const,
                joinedAt: new Date().toISOString(),
                group: invite.group,
              },
            ],
          }
        : {}),
    });

    try {
      const [groups, pendingInvites] = await Promise.all([
        getUserActiveGroups(userId),
        getUserPendingInvites(userId),
      ]);
      set({ groups, pendingInvites, isLoading: false });
    } catch (error) {
      set({
        error: `Invitation ${accept ? "accepted" : "declined"}, but group data could not be refreshed: ${getErrorMessage(error, "Please retry.")}`,
        isLoading: false,
      });
      throw error;
    }
  },
});
