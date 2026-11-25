import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
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
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const selectedExpense = useExpenseStore((state) => state.selectedExpense);
  const fetchExpenseDetail = useExpenseStore(
    (state) => state.fetchExpenseDetail,
  );
  const fetchGroupExpensesAndBalances = useExpenseStore(
    (state) => state.fetchGroupExpensesAndBalances,
  );
  const toggleSettleSplit = useExpenseStore((state) => state.toggleSettleSplit);
  const removeExpense = useExpenseStore((state) => state.removeExpense);
  const clearExpenseError = useExpenseStore((state) => state.clearError);
  const groups = useGroupStore((state) => state.groups);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const clearGroupError = useGroupStore((state) => state.clearError);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletedGroupId, setDeletedGroupId] = useState<string | null>(null);

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
