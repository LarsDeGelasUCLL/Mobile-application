import {
  approveJoinRequest,
  getGroupJoinRequests,
  removeMembership,
} from "../../services";
import type { GroupActionCreator, GroupState } from "./groupStoreTypes";
import { getErrorMessage } from "../../utils/errors";

// Drops a handled request from the admin list and lowers that group's badge count.
export function withoutJoinRequest(
  state: Pick<GroupState, "joinRequests" | "joinRequestCounts">,
  membershipId: string,
  groupId: string,
): Pick<GroupState, "joinRequests" | "joinRequestCounts"> {
  if (!state.joinRequests.some((item) => item.id === membershipId)) {
    return {
      joinRequests: state.joinRequests,
      joinRequestCounts: state.joinRequestCounts,
    };
  }
  return {
    joinRequests: state.joinRequests.filter((item) => item.id !== membershipId),
    joinRequestCounts: {
      ...state.joinRequestCounts,
      [groupId]: Math.max((state.joinRequestCounts[groupId] ?? 1) - 1, 0),
    },
  };
}

export const createGroupJoinRequestActions: GroupActionCreator<
  | "fetchJoinRequestsForGroup"
  | "approveJoinRequest"
  | "rejectJoinRequest"
  | "cancelJoinRequest"
> = (set, get) => {
  // Shared isLoading/error/re-throw wrapper for every join request action.
  const run = async (fallback: string, action: () => Promise<void>) => {
    set({ isLoading: true, error: null });
    try {
      await action();
      set({ isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, fallback), isLoading: false });
      throw error;
    }
  };

  return {
    fetchJoinRequestsForGroup: (groupId) =>
      run("Could not load join requests.", async () => {
        const joinRequests = await getGroupJoinRequests(groupId);
        set({
          joinRequests,
          joinRequestCounts: {
            ...get().joinRequestCounts,
            [groupId]: joinRequests.length,
          },
        });
      }),

    approveJoinRequest: (membershipId) =>
      run("Could not approve join request.", async () => {
        const member = await approveJoinRequest(membershipId);
        set(withoutJoinRequest(get(), membershipId, member.groupId));
        if (get().selectedGroupId === member.groupId) {
          set({ activeGroupMembers: [...get().activeGroupMembers, member] });
        }
      }),

    rejectJoinRequest: (membershipId) =>
      run("Could not reject join request.", async () => {
        const request = get().joinRequests.find(
          (item) => item.id === membershipId,
        );
        await removeMembership(membershipId);
        if (request) {
          set(withoutJoinRequest(get(), membershipId, request.groupId));
        }
      }),

    cancelJoinRequest: (membershipId) =>
      run("Could not cancel join request.", async () => {
        await removeMembership(membershipId);
        set({
          sentJoinRequests: get().sentJoinRequests.filter(
            (item) => item.membershipId !== membershipId,
          ),
        });
      }),
  };
};
