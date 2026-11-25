import { useCallback, useEffect } from "react";
import { router } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { canManageExpense } from "./expensePermissions";
import {
  participantsErrorFallback,
  useParticipantOptions,
} from "./useExpenseParticipants";
import { useLoadState } from "../shared/useLoadState";
import type { ValidExpenseForm } from "../../services/expenses/expenseValidation";
import { useAuthStore } from "../../state/useAuthStore";
import { useExpenseStore } from "../../state/useExpenseStore";
import { useGroupStore } from "../../state/useGroupStore";

/**
 * The edit expense page. One load runs the expense, then its participants,
 * then (group expense) the user's groups for the admin check; any failed
 * step shows in `loadError`.
 */
export function useEditExpense(expenseId: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const {
    selectedExpense,
    expenseLoading,
    expenseError,
    fetchExpenseDetail,
    updateExpense,
    clearExpenseError,
  } = useExpenseStore(
    useShallow((state) => ({
      selectedExpense: state.selectedExpense,
      expenseLoading: state.isLoading,
      expenseError: state.error,
      fetchExpenseDetail: state.fetchExpenseDetail,
      updateExpense: state.updateExpense,
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
  const expense = selectedExpense?.id === expenseId ? selectedExpense : null;
  const { participants, fetchParticipants } = useParticipantOptions(
    expense?.groupId ?? null,
  );
  // The page has always shown the participants fallback for any failed step.
  const { isLoading, isLoaded, error, run } = useLoadState(
    participantsErrorFallback,
  );
  const canManage = canManageExpense(user, expense, groups);

  const reload = useCallback(async () => {
    if (!expenseId) return;
    clearExpenseError();
    clearGroupError();
    await run(async () => {
      await fetchExpenseDetail(expenseId);
      const loadedExpense = useExpenseStore.getState().selectedExpense;
      if (!loadedExpense) return;
      await fetchParticipants(loadedExpense.groupId);
      if (loadedExpense.groupId && userId) await fetchGroupsAndInvites(userId);
    });
  }, [
    clearExpenseError,
    clearGroupError,
    expenseId,
    fetchExpenseDetail,
    fetchGroupsAndInvites,
    fetchParticipants,
    run,
    userId,
  ]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = async (draft: ValidExpenseForm) => {
    if (!expense) return;
    try {
      await updateExpense(expense.id, {
        ...draft,
        groupId: expense.groupId,
      });
      if (useExpenseStore.getState().error) return;
      router.replace({
        pathname: "/expense/[expenseId]",
        params: { expenseId: expense.id },
      });
    } catch {
      // The expense store exposes update failures to the form.
    }
  };

  const loadError = error ?? groupError;
  return {
    currentUserId: userId ?? "",
    expense,
    canManage,
    participants,
    participantsLoading: isLoading,
    participantsLoaded: isLoaded,
    loadError,
    // Same condition as the page's form branch.
    showForm:
      !!expense &&
      canManage &&
      !loadError &&
      isLoaded &&
      participants.length > 0,
    expenseLoading,
    expenseError,
    groupLoading,
    reload,
    save,
  };
}
