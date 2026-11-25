import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { loadGroupDetail } from "./groupDetailLoader";
import { useAuthStore } from "../../state/useAuthStore";
import { useGroupStore } from "../../state/useGroupStore";
import { useExpenseStore } from "../../state/useExpenseStore";

/** Loads one group (membership, members, join requests, expenses, balances)
 * for the group detail, settings and expenses pages. */
export function useGroupDetail(groupId: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const {
    groups,
    allActiveGroupMembers,
    allJoinRequests,
    isLoading,
    storeError,
    fetchGroupsAndInvites,
    fetchMembersForGroup,
    fetchJoinRequestsForGroup,
    setSelectedGroupId,
    clearError,
  } = useGroupStore(
    useShallow((state) => ({
      groups: state.groups,
      allActiveGroupMembers: state.activeGroupMembers,
      allJoinRequests: state.joinRequests,
      isLoading: state.isLoading,
      storeError: state.error,
      fetchGroupsAndInvites: state.fetchGroupsAndInvites,
      fetchMembersForGroup: state.fetchMembersForGroup,
      fetchJoinRequestsForGroup: state.fetchJoinRequestsForGroup,
      setSelectedGroupId: state.setSelectedGroupId,
      clearError: state.clearError,
    })),
  );
  const {
    expensesInStore,
    groupBalances,
    groupBalancesGroupId,
    expensesLoading,
    expensesError,
    fetchGroupExpensesAndBalances,
    clearExpenseError,
  } = useExpenseStore(
    useShallow((state) => ({
      expensesInStore: state.groupExpenses,
      groupBalances: state.groupBalances,
      groupBalancesGroupId: state.groupBalancesGroupId,
      expensesLoading: state.isLoading,
      expensesError: state.error,
      fetchGroupExpensesAndBalances: state.fetchGroupExpensesAndBalances,
      clearExpenseError: state.clearError,
    })),
  );

  const groupMembership = groups.find((item) => item.group.id === groupId);
  const members = allActiveGroupMembers.filter(
    (membership) => membership.groupId === groupId,
  );
  // The store keeps requests of the last loaded group only.
  const joinRequests = allJoinRequests.filter(
    (request) => request.groupId === groupId,
  );

  const reload = useCallback(async () => {
    if (!userId || !groupId) return;
    clearError();
    clearExpenseError();
    try {
      const isActive = await loadGroupDetail(
        userId,
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
    userId,
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
