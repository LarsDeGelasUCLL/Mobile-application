import { useState } from "react";
import { router } from "expo-router";
import { useExpenseParticipants } from "./useExpenseParticipants";
import type { ValidExpenseForm } from "../../services/expenses/expenseValidation";
import { useAuthStore } from "../../state/useAuthStore";
import { useExpenseStore } from "../../state/useExpenseStore";
import { useGroupStore } from "../../state/useGroupStore";

/** The create expense page: participants, create, and the partial success
 * (expense saved, group balances not refreshed) with its retry. */
export function useCreateExpense(groupId: string | null) {
  const userId = useAuthStore((state) => state.user?.id);
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const fetchGroupExpensesAndBalances = useExpenseStore(
    (state) => state.fetchGroupExpensesAndBalances,
  );
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const participants = useExpenseParticipants(groupId);
  const [createdExpenseId, setCreatedExpenseId] = useState<string | null>(null);
  const [partialMutationError, setPartialMutationError] = useState<
    string | null
  >(null);

  const create = async (draft: ValidExpenseForm) => {
    try {
      const created = await addExpense({ ...draft, groupId });
      // An error after a resolved add = saved, but the balance refresh failed.
      const mutationError = useExpenseStore.getState().error;
      if (mutationError) {
        setCreatedExpenseId(created.id);
        setPartialMutationError(mutationError);
        return;
      }
      router.replace({
        pathname: "/expense/[expenseId]",
        params: { expenseId: created.id },
      });
    } catch {
      // The expense store exposes create failures to the form.
    }
  };

  // Retry only the balance refresh; the expense already exists.
  const retryBalances = async () => {
    if (!groupId || !createdExpenseId) return;
    try {
      await fetchGroupExpensesAndBalances(groupId);
      if (!useExpenseStore.getState().error) {
        router.replace({
          pathname: "/expense/[expenseId]",
          params: { expenseId: createdExpenseId },
        });
      }
    } catch {
      // The expense store keeps the retryable balance error.
    }
  };

  const loadError = participants.error ?? (groupId ? groupError : null);
  return {
    currentUserId: userId ?? "",
    participants: participants.participants,
    participantsLoading: participants.isLoading,
    participantsLoaded: participants.isLoaded,
    reloadParticipants: participants.reload,
    loadError,
    // Same condition as the page's form branch.
    showForm:
      !createdExpenseId &&
      !loadError &&
      participants.isLoaded &&
      participants.participants.length > 0,
    isPartialSuccess: !!createdExpenseId,
    partialSuccessMessage: expenseError ?? partialMutationError ?? "",
    expenseLoading,
    expenseError,
    groupLoading,
    create,
    retryBalances,
  };
}
