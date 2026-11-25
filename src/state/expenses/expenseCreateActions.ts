import {
  calculateGroupBalances,
  createExpense,
  updateExpense,
} from "../../services";
import type { ExpenseDto } from "../../types";
import type { ExpenseActionCreator } from "./expenseStoreTypes";
import { getErrorMessage } from "../../utils/errors";

export const createExpenseCreateActions: ExpenseActionCreator<
  "addExpense" | "updateExpense"
> = (set, get) => ({
  addExpense: async (payload) => {
    set({ isLoading: true, error: null });
    let created: ExpenseDto;
    try {
      created = await createExpense(payload);
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not add expense."),
        isLoading: false,
      });
      throw error;
    }

    if (payload.groupId === null) {
      set({
        individualExpenses: [created, ...get().individualExpenses],
        isLoading: false,
      });
      return created;
    }

    set({ groupExpenses: [created, ...get().groupExpenses] });
    try {
      const groupBalances = await calculateGroupBalances(payload.groupId);
      set({
        groupBalances,
        groupBalancesGroupId: payload.groupId,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: `Expense created, but group balances could not be refreshed. ${getErrorMessage(error, "Try again.")}`,
        isLoading: false,
      });
    }
    return created;
  },

  updateExpense: async (expenseId, payload) => {
    set({ isLoading: true, error: null });
    let updated: ExpenseDto;
    try {
      updated = await updateExpense(expenseId, payload);
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not update expense."),
        isLoading: false,
      });
      throw error;
    }

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
    });

    if (updated.groupId === null) {
      set({ isLoading: false });
      return updated;
    }

    try {
      const groupBalances = await calculateGroupBalances(updated.groupId);
      set({
        groupBalances,
        groupBalancesGroupId: updated.groupId,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: `Expense updated, but group balances could not be refreshed. ${getErrorMessage(error, "Try again.")}`,
        isLoading: false,
      });
    }
    return updated;
  },
});
