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

      if (typeof groupId === "string") {
        const groupBalances = await calculateGroupBalances(groupId);
        set({
          groupExpenses,
          individualExpenses,
          selectedExpense,
          groupBalances,
          isLoading: false,
        });
      } else {
        set({
          groupExpenses,
          individualExpenses,
          selectedExpense,
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
