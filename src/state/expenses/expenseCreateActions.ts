import { calculateGroupBalances, createExpense } from "../../services";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

export const createExpenseCreateActions: ExpenseActionCreator<"addExpense"> = (
  set,
  get,
) => ({
  addExpense: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createExpense(payload);
      if (payload.groupId !== null) {
        const groupBalances = await calculateGroupBalances(payload.groupId);
        set({
          groupExpenses: [created, ...get().groupExpenses],
          groupBalances,
          isLoading: false,
        });
      } else {
        set({
          individualExpenses: [created, ...get().individualExpenses],
          isLoading: false,
        });
      }
      return created;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not add expense."),
        isLoading: false,
      });
      throw error;
    }
  },
});
