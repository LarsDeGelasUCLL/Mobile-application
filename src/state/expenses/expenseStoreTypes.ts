import type { StateCreator } from "zustand";
import type {
  CreateExpenseDto,
  ExpenseDto,
  UserBalanceDto,
} from "../../types";

export interface ExpenseState {
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

export type ExpenseActionCreator<Keys extends keyof ExpenseState> =
  StateCreator<ExpenseState, [], [], Pick<ExpenseState, Keys>>;
