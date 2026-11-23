import { useCallback, useEffect } from "react";
import { loadGroupDetail } from "./groupDetailLoader";
import { useAuthStore } from "../../state/useAuthStore";
import { useGroupStore } from "../../state/useGroupStore";
import { useExpenseStore } from "../../state/useExpenseStore";

/** Loads one group (membership, members, join requests, expenses, balances)
 * for the group detail, settings and expenses pages. */
export function useGroupDetail(groupId: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);
  const allActiveGroupMembers = useGroupStore(
    (state) => state.activeGroupMembers,
  );
  const allJoinRequests = useGroupStore((state) => state.joinRequests);
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const fetchMembersForGroup = useGroupStore(
    (state) => state.fetchMembersForGroup,
  );
  const fetchJoinRequestsForGroup = useGroupStore(
    (state) => state.fetchJoinRequestsForGroup,
  );
  const setSelectedGroupId = useGroupStore((state) => state.setSelectedGroupId);
  const clearError = useGroupStore((state) => state.clearError);
  const expensesInStore = useExpenseStore((state) => state.groupExpenses);
  const groupBalances = useExpenseStore((state) => state.groupBalances);
  const groupBalancesGroupId = useExpenseStore(
    (state) => state.groupBalancesGroupId,
  );
  const expensesLoading = useExpenseStore((state) => state.isLoading);
  const expensesError = useExpenseStore((state) => state.error);
  const fetchGroupExpensesAndBalances = useExpenseStore(
    (state) => state.fetchGroupExpensesAndBalances,
  );
  const clearExpenseError = useExpenseStore((state) => state.clearError);

  const groupMembership = groups.find((item) => item.group.id === groupId);
  const members = allActiveGroupMembers.filter(
    (membership) => membership.groupId === groupId,
  );
  // The store keeps requests of the last loaded group only.
  const joinRequests = allJoinRequests.filter(
    (request) => request.groupId === groupId,
  );

  const reload = useCallback(async () => {
    if (!user?.id || !groupId) return;
    clearError();
    clearExpenseError();
    try {
      const isActive = await loadGroupDetail(
        user.id,
        groupId,
        fetchGroupsAndInvites,
        fetchMembersForGroup,
        (id) =>
          useGroupStore.getState().groups.some((item) => item.group.id === id),
      );
      if (!isActive) {
        setSelectedGroupId(null);
        return;
      }
      const loadedAsAdmin = useGroupStore
        .getState()
        .groups.some(
          (item) => item.group.id === groupId && item.groupRole === "ADMIN",
        );
      await Promise.all([
        fetchGroupExpensesAndBalances(groupId),
        loadedAsAdmin ? fetchJoinRequestsForGroup(groupId) : undefined,
      ]);
    } catch {
      // The relevant store exposes the load failure for its retry banner.
    }
  }, [
    clearError,
    clearExpenseError,
    fetchGroupExpensesAndBalances,
    fetchJoinRequestsForGroup,
    fetchGroupsAndInvites,
    fetchMembersForGroup,
    groupId,
    setSelectedGroupId,
    user?.id,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    user,
    group: groupMembership?.group,
    isAdmin: groupMembership?.groupRole === "ADMIN",
    members,
    currentMembership: members.find(
      (membership) => membership.userId === user?.id,
    ),
    joinRequests,
    groupExpenses: expensesInStore.filter(
      (expense) => expense.groupId === groupId,
    ),
    visibleBalances: groupBalancesGroupId === groupId ? groupBalances : [],
    balancesLoaded: groupBalancesGroupId === groupId,
    isLoading,
    storeError,
    expensesLoading,
    expensesError,
    reload,
    retryExpenses: () =>
      void (groupId
        ? fetchGroupExpensesAndBalances(groupId).catch(() => undefined)
        : undefined),
  };
}
