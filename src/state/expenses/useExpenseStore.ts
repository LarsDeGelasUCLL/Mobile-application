import { create } from "zustand";
import { createExpenseCreateActions } from "./expenseCreateActions";
import { createExpenseDeleteActions } from "./expenseDeleteActions";
import { createExpenseLoadActions } from "./expenseLoadActions";
import { createExpenseSplitActions } from "./expenseSplitActions";
import type { ExpenseState } from "./expenseStoreTypes";

export const useExpenseStore = create<ExpenseState>()((set, get, api) => ({
  groupExpenses: [],
  individualExpenses: [],
  selectedExpense: null,
  groupBalances: [],
  isLoading: false,
  error: null,
  ...createExpenseLoadActions(set, get, api),
  ...createExpenseCreateActions(set, get, api),
  ...createExpenseSplitActions(set, get, api),
  ...createExpenseDeleteActions(set, get, api),
  clearError: () => set({ error: null }),
  resetExpenseStore: () =>
    set({
      groupExpenses: [],
      individualExpenses: [],
      selectedExpense: null,
      groupBalances: [],
      isLoading: false,
      error: null,
    }),
}));
