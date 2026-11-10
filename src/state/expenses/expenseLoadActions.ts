import type { ExpenseActionCreator } from "./expenseStoreTypes";
import {
  calculateGroupBalances,
  getExpenseById,
  getGroupExpenses,
  getIndividualExpenses,
} from "../../services";
import { getErrorMessage } from "../shared/storeUtils";

export const createExpenseLoadActions: ExpenseActionCreator<
  | "fetchGroupExpensesAndBalances"
  | "fetchIndividualExpenses"
  | "fetchExpenseDetail"
> = (set) => ({
  fetchGroupExpensesAndBalances: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const [groupExpenses, groupBalances] = await Promise.all([
        getGroupExpenses(groupId),
        calculateGroupBalances(groupId),
      ]);
      set({ groupExpenses, groupBalances, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not load group expenses."),
        isLoading: false,
      });
      throw error;
    }
  },

  fetchIndividualExpenses: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const individualExpenses = await getIndividualExpenses(userId);
      set({ individualExpenses, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not load individual expenses."),
        isLoading: false,
      });
      throw error;
    }
  },

  fetchExpenseDetail: async (expenseId) => {
    set({ isLoading: true, error: null });
    try {
      const selectedExpense = await getExpenseById(expenseId);
      set({ selectedExpense, isLoading: false });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Could not load expense details."),
        isLoading: false,
      });
      throw error;
    }
  },
});
