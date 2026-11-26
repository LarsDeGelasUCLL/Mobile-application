import type { ExpenseDto } from "../../types";
import { calculateGroupBalances, settleExpenseSplit } from "../../services";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { errorMessage, t } from "../../i18n";

/** Copies `expenses` with the split's `isSettled` changed. */
function updateSplitStatus(
  expenses: ExpenseDto[],
  splitId: string,
  isSettled: boolean,
): ExpenseDto[] {
  return expenses.map((expense) => ({
    ...expense,
    splits: expense.splits.map((split) =>
      split.id === splitId ? { ...split, isSettled } : split,
    ),
  }));
}

// Mark a split paid or unpaid. Same error pattern as the create actions.
export const createExpenseSplitActions: ExpenseActionCreator<
  "toggleSettleSplit"
> = (set, get) => ({
  toggleSettleSplit: async (splitId, isSettled, groupId) => {
    // Check locally first, so an obviously invalid toggle never reaches the server.
    const state = get();
    const expense = [
      state.selectedExpense,
      ...state.groupExpenses,
      ...state.individualExpenses,
    ].find((candidate) =>
      candidate?.splits.some((split) => split.id === splitId),
    );
    const split = expense?.splits.find((item) => item.id === splitId);
    if (!expense || !split) {
      throw new Error("errors.store.splitNotLoaded");
    }
    if (split.userId === expense.paidByUserId) {
      throw new Error("errors.store.payerOwnSplit");
    }

    set({ isLoading: true, error: null });
    try {
      await settleExpenseSplit(splitId, isSettled);
      const groupExpenses = updateSplitStatus(
        get().groupExpenses,
        splitId,
        isSettled,
      );
      const individualExpenses = updateSplitStatus(
        get().individualExpenses,
        splitId,
        isSettled,
      );
      const currentSelectedExpense = get().selectedExpense;
      const selectedExpense = currentSelectedExpense
        ? updateSplitStatus([currentSelectedExpense], splitId, isSettled)[0]
        : null;

      set({ groupExpenses, individualExpenses, selectedExpense });

      if (typeof groupId !== "string") {
        set({ isLoading: false });
        return;
      }

      try {
        const groupBalances = await calculateGroupBalances(groupId);
        set({
          groupBalances,
          groupBalancesGroupId: groupId,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: t("errors.partial.paymentStatusUpdated", {
            reason: errorMessage(error, "errors.fallback.tryAgain"),
          }),
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: errorMessage(error, "errors.fallback.updatePaymentStatus"),
        isLoading: false,
      });
      throw error;
    }
  },
});
