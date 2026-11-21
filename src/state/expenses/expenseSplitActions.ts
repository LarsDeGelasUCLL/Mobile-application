import type { ExpenseDto } from "../../types";
import { calculateGroupBalances, settleExpenseSplit } from "../../services";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

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

export const createExpenseSplitActions: ExpenseActionCreator<
  "toggleSettleSplit"
> = (set, get) => ({
  toggleSettleSplit: async (splitId, isSettled, groupId) => {
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
      throw new Error("Expense split is not available in the store.");
    }
    if (split.userId === expense.paidByUserId) {
      throw new Error("Cannot change settlement for the payer's own split.");
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
          error: `Payment status updated, but group balances could not be refreshed. ${getErrorMessage(error, "Try again.")}`,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not update payment status."),
        isLoading: false,
      });
      throw error;
    }
  },
});
