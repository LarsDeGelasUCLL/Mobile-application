import type { ExpenseActionCreator } from "./expenseStoreTypes";
import {
  calculateGroupBalances,
  getExpenseById,
  getGroupExpenses,
  getIndividualExpenses,
  getUserExpenseParticipants,
} from "../../services";
import { errorMessage } from "../../i18n";

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
        error: errorMessage(error, "errors.fallback.loadGroupExpenses"),
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
        error: errorMessage(error, "errors.fallback.loadIndividualExpenses"),
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
        error: errorMessage(error, "errors.fallback.loadExpense"),
        isLoading: false,
      });
      throw error;
    }
  },

  // A failed history load sets the store error (fetchIndividualExpenses);
  // a failed participants lookup only rejects, leaving the store error unset.
  fetchExpenseParticipants: async (userId) => {
    await get().fetchIndividualExpenses(userId);
    return getUserExpenseParticipants(userId, get().individualExpenses);
  },
});
