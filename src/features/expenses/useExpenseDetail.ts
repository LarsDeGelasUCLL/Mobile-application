import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { canManageExpense, canSettleSplit } from "./expensePermissions";
import { useAuthStore } from "../../state/useAuthStore";
import { useExpenseStore } from "../../state/useExpenseStore";
import { useGroupStore } from "../../state/useGroupStore";
import type { ExpenseSplitDto } from "../../types";

/** The expense detail page: load (with group roles and balances), settle,
 * and delete, including a delete whose balance refresh failed. */
export function useExpenseDetail(expenseId: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const {
    expenseLoading,
    expenseError,
    selectedExpense,
    fetchExpenseDetail,
    fetchGroupExpensesAndBalances,
    toggleSettleSplit,
    removeExpense,
    clearExpenseError,
  } = useExpenseStore(
    useShallow((state) => ({
      expenseLoading: state.isLoading,
      expenseError: state.error,
      selectedExpense: state.selectedExpense,
      fetchExpenseDetail: state.fetchExpenseDetail,
      fetchGroupExpensesAndBalances: state.fetchGroupExpensesAndBalances,
      toggleSettleSplit: state.toggleSettleSplit,
      removeExpense: state.removeExpense,
      clearExpenseError: state.clearError,
    })),
  );
  const {
    groups,
    groupLoading,
    groupError,
    fetchGroupsAndInvites,
    clearGroupError,
  } = useGroupStore(
    useShallow((state) => ({
      groups: state.groups,
      groupLoading: state.isLoading,
      groupError: state.error,
      fetchGroupsAndInvites: state.fetchGroupsAndInvites,
      clearGroupError: state.clearError,
    })),
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Set when the delete worked but the group balance refresh failed (for the retry).
  const [deletedGroupId, setDeletedGroupId] = useState<string | null>(null);

  // Ignore a stale expense from an earlier detail page.
  const expense = selectedExpense?.id === expenseId ? selectedExpense : null;

  const reload = useCallback(async () => {
    if (!expenseId) return;
    clearExpenseError();
    clearGroupError();
    try {
      await fetchExpenseDetail(expenseId);
      const loadedExpense = useExpenseStore.getState().selectedExpense;
      if (loadedExpense?.groupId && userId) {
        await fetchGroupsAndInvites(userId);
        await fetchGroupExpensesAndBalances(loadedExpense.groupId);
      }
    } catch {
      // The stores expose load failures for the retry banner.
    }
  }, [
    clearExpenseError,
    clearGroupError,
    expenseId,
    fetchExpenseDetail,
    fetchGroupExpensesAndBalances,
    fetchGroupsAndInvites,
    userId,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Reload the expense, or, after a half-failed delete, retry the balance refresh.
  const retry = async () => {
    if (expense?.id) {
      await reload();
      return;
    }
    const groupId = deletedGroupId;
    if (groupId) {
      clearExpenseError();
      try {
        await fetchGroupExpensesAndBalances(groupId);
      } catch {
        // The expense store keeps the retryable balance error.
      }
    }
  };

  const deleteExpense = async () => {
    if (!expense) return;
    clearExpenseError();
    try {
      await removeExpense(expense.id, expense.groupId);
      if (useExpenseStore.getState().error) {
        setDeletedGroupId(expense.groupId);
        setConfirmDelete(false);
        return;
      }
      if (expense.groupId) {
        router.replace({
          pathname: "/group/[groupId]",
          params: { groupId: expense.groupId },
        });
      } else {
        router.replace("/expenses");
      }
    } catch {
      setConfirmDelete(false);
    }
  };

  return {
    expense,
    canManage: canManageExpense(user, expense, groups),
    canSettle: (split: ExpenseSplitDto) =>
      !!expense && canSettleSplit(user, expense, split),
    toggleSettled: (split: ExpenseSplitDto) =>
      void toggleSettleSplit(
        split.id,
        !split.isSettled,
        expense?.groupId,
      ).catch(() => undefined),
    expenseLoading,
    isLoading: expenseLoading || groupLoading,
    error: expenseError ?? groupError,
    deletedGroupId,
    confirmDelete,
    setConfirmDelete,
    reload,
    retry,
    deleteExpense,
  };
}
