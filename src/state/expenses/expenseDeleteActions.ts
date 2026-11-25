import { calculateGroupBalances, deleteExpense } from "../../services";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { getErrorMessage } from "../../utils/errors";

export const createExpenseDeleteActions: ExpenseActionCreator<
  "removeExpense"
> = (set, get) => ({
  removeExpense: async (expenseId, groupId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteExpense(expenseId);
      const groupExpenses = get().groupExpenses.filter(
        (expense) => expense.id !== expenseId,
      );
      const individualExpenses = get().individualExpenses.filter(
        (expense) => expense.id !== expenseId,
      );
      set({
        groupExpenses,
        individualExpenses,
        selectedExpense:
          get().selectedExpense?.id === expenseId
            ? null
            : get().selectedExpense,
      });

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
          error: `Expense deleted, but group balances could not be refreshed. ${getErrorMessage(error, "Try again.")}`,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not delete expense."),
        isLoading: false,
      });
      throw error;
    }
  },
});
