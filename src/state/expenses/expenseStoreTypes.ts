import type { StateCreator } from "zustand";
import type {
  CreateExpenseDto,
  ExpenseDto,
  PublicUserProfileDto,
  UpdateExpenseDto,
  UserBalanceDto,
} from "../../types";

export interface ExpenseState {
  groupExpenses: ExpenseDto[];
  individualExpenses: ExpenseDto[];
  selectedExpense: ExpenseDto | null;
  groupBalances: UserBalanceDto[];
  groupBalancesGroupId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchGroupExpensesAndBalances: (groupId: string) => Promise<void>;
  fetchIndividualExpenses: (userId: string) => Promise<void>;
  fetchExpenseDetail: (expenseId: string) => Promise<void>;
  /** Loads the personal history, then everyone the user can split with. */
  fetchExpenseParticipants: (userId: string) => Promise<PublicUserProfileDto[]>;
  addExpense: (payload: CreateExpenseDto) => Promise<ExpenseDto>;
  updateExpense: (
    expenseId: string,
    payload: UpdateExpenseDto,
  ) => Promise<ExpenseDto>;
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
