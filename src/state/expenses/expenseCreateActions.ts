import {
  calculateGroupBalances,
  createExpense,
  updateExpense,
} from "../../services";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { getErrorMessage } from "../shared/storeUtils";

export const createExpenseCreateActions: ExpenseActionCreator<
  "addExpense" | "updateExpense"
> = (set, get) => ({
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

  updateExpense: async (expenseId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateExpense(expenseId, payload);
      const groupBalances =
        updated.groupId !== null
          ? await calculateGroupBalances(updated.groupId)
          : get().groupBalances;
      set({
        groupExpenses: get().groupExpenses.map((expense) =>
          expense.id === expenseId ? updated : expense,
        ),
        individualExpenses: get().individualExpenses.map((expense) =>
          expense.id === expenseId ? updated : expense,
        ),
        selectedExpense:
          get().selectedExpense?.id === expenseId
            ? updated
            : get().selectedExpense,
        groupBalances,
        isLoading: false,
      });
      return updated;
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not update expense."),
        isLoading: false,
      });
      throw error;
    }
  },
});
