import { calculateGroupBalances, deleteExpense } from "../../services";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

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

      if (typeof groupId === "string") {
        const groupBalances = await calculateGroupBalances(groupId);
        set({
          groupExpenses,
          individualExpenses,
          groupBalances,
          isLoading: false,
        });
      } else {
        set({ groupExpenses, individualExpenses, isLoading: false });
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
