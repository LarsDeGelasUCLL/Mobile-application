import type { ExpenseActionCreator } from "./expenseStoreTypes";
import {
  calculateGroupBalances,
  getExpenseById,
  getGroupExpenses,
  getIndividualExpenses,
  getUserExpenseParticipants,
} from "../../services";
import { getErrorMessage } from "../../utils/errors";

export const createExpenseLoadActions: ExpenseActionCreator<
  | "fetchGroupExpensesAndBalances"
  | "fetchIndividualExpenses"
  | "fetchExpenseDetail"
  | "fetchExpenseParticipants"
> = (set, get) => ({
  fetchGroupExpensesAndBalances: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const groupExpenses = await getGroupExpenses(groupId);
      const groupBalances = await calculateGroupBalances(
        groupId,
        groupExpenses,
      );
      set({
        groupExpenses,
        groupBalances,
        groupBalancesGroupId: groupId,
        isLoading: false,
      });
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

  // Participant failures reach the caller only; the store error stays unset.
  fetchExpenseParticipants: async (userId) => {
    await get().fetchIndividualExpenses(userId);
    return getUserExpenseParticipants(userId, get().individualExpenses);
  },
});
