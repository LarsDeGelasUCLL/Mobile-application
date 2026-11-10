import { create } from "zustand";
import {
  createExpense,
  getGroupExpenses,
  getIndividualExpenses,
  getExpenseById,
  settleExpenseSplit,
  deleteExpense,
  calculateGroupBalances,
} from "../services";
import type { ExpenseDto, CreateExpenseDto, UserBalanceDto } from "../types";

interface ExpenseState {
  groupExpenses: ExpenseDto[];
  individualExpenses: ExpenseDto[];
  selectedExpense: ExpenseDto | null;
  groupBalances: UserBalanceDto[];
  isLoading: boolean;
  error: string | null;

  fetchGroupExpensesAndBalances: (groupId: string) => Promise<void>;
  fetchIndividualExpenses: (userId: string) => Promise<void>;
  fetchExpenseDetail: (expenseId: string) => Promise<void>;
  addExpense: (payload: CreateExpenseDto) => Promise<ExpenseDto>;
  toggleSettleSplit: (
    splitId: string,
    isSettled: boolean,
    groupId?: string | null,
  ) => Promise<void>;
  removeExpense: (expenseId: string, groupId?: string | null) => Promise<void>;
  clearError: () => void;
  resetExpenseStore: () => void;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  groupExpenses: [],
  individualExpenses: [],
  selectedExpense: null,
  groupBalances: [],
  isLoading: false,
  error: null,

  fetchGroupExpensesAndBalances: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const [expenses, balances] = await Promise.all([
        getGroupExpenses(groupId),
        calculateGroupBalances(groupId),
      ]);
      set({
        groupExpenses: expenses,
        groupBalances: balances,
        isLoading: false,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Could not load group expenses.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchIndividualExpenses: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await getIndividualExpenses(userId);
      set({ individualExpenses: expenses, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not load individual expenses.",
      );
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchExpenseDetail: async (expenseId) => {
    set({ isLoading: true, error: null });
    try {
      const expense = await getExpenseById(expenseId);
      set({ selectedExpense: expense, isLoading: false });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not load expense details.",
      );
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  addExpense: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await createExpense(payload);

      if (payload.groupId !== null) {
        // Group expense: add it to the top and recalculate the balance immediately
        const updatedBalances = await calculateGroupBalances(payload.groupId);
        set({
          groupExpenses: [created, ...get().groupExpenses],
          groupBalances: updatedBalances,
          isLoading: false,
        });
      } else {
        // Individual expense between users
        set({
          individualExpenses: [created, ...get().individualExpenses],
          isLoading: false,
        });
      }

      return created;
    } catch (error) {
      const message = getErrorMessage(error, "Could not add expense.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  toggleSettleSplit: async (splitId, isSettled, groupId) => {
    set({ isLoading: true, error: null });
    try {
      await settleExpenseSplit(splitId, isSettled);

      // Update the split status in the local lists
      const updateSplitsInList = (list: ExpenseDto[]): ExpenseDto[] =>
        list.map((exp) => ({
          ...exp,
          splits: exp.splits.map((sp) =>
            sp.id === splitId ? { ...sp, isSettled } : sp,
          ),
        }));

      const updatedGroupExpenses = updateSplitsInList(get().groupExpenses);
      const updatedIndividualExpenses = updateSplitsInList(
        get().individualExpenses,
      );

      const currentSelected = get().selectedExpense;
      const updatedSelected =
        currentSelected !== null
          ? {
              ...currentSelected,
              splits: currentSelected.splits.map((sp) =>
                sp.id === splitId ? { ...sp, isSettled } : sp,
              ),
            }
          : null;

      // Recalculate the balance immediately for group expenses
      if (typeof groupId === "string") {
        const updatedBalances = await calculateGroupBalances(groupId);
        set({
          groupExpenses: updatedGroupExpenses,
          individualExpenses: updatedIndividualExpenses,
          selectedExpense: updatedSelected,
          groupBalances: updatedBalances,
          isLoading: false,
        });
      } else {
        set({
          groupExpenses: updatedGroupExpenses,
          individualExpenses: updatedIndividualExpenses,
          selectedExpense: updatedSelected,
          isLoading: false,
        });
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Could not update payment status.",
      );
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  removeExpense: async (expenseId, groupId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteExpense(expenseId);

      const filteredGroup = get().groupExpenses.filter(
        (e) => e.id !== expenseId,
      );
      const filteredIndividual = get().individualExpenses.filter(
        (e) => e.id !== expenseId,
      );

      if (typeof groupId === "string") {
        const updatedBalances = await calculateGroupBalances(groupId);
        set({
          groupExpenses: filteredGroup,
          individualExpenses: filteredIndividual,
          groupBalances: updatedBalances,
          isLoading: false,
        });
      } else {
        set({
          groupExpenses: filteredGroup,
          individualExpenses: filteredIndividual,
          isLoading: false,
        });
      }
    } catch (error) {
      const message = getErrorMessage(error, "Could not delete expense.");
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  resetExpenseStore: () => {
    set({
      groupExpenses: [],
      individualExpenses: [],
      selectedExpense: null,
      groupBalances: [],
      isLoading: false,
      error: null,
    });
  },
}));
