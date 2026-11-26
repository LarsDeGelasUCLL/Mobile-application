import type { StateCreator } from "zustand";
import type {
  CreateExpenseDto,
  ExpenseDto,
  PublicUserProfileDto,
  UpdateExpenseDto,
  UserBalanceDto,
} from "../../types";

export interface ExpenseState {
  /** Expenses of the last group loaded. */
  groupExpenses: ExpenseDto[];
  /** The user's personal (no group) expenses. */
  individualExpenses: ExpenseDto[];
  /** The expense on the detail screen. */
  selectedExpense: ExpenseDto | null;
  groupBalances: UserBalanceDto[];
  /** Which group `groupBalances` belong to, so a screen never shows another group's. */
  groupBalancesGroupId: string | null;
  isLoading: boolean;
  /** Translated message of the last failure (or partial success). */
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
  /** Pass `groupId` to refresh that group's balances afterwards. */
  toggleSettleSplit: (
    splitId: string,
    isSettled: boolean,
    groupId?: string | null,
  ) => Promise<void>;
  /** Pass `groupId` to refresh that group's balances afterwards. */
  removeExpense: (expenseId: string, groupId?: string | null) => Promise<void>;
  clearError: () => void;
  resetExpenseStore: () => void;
}

/** Typed creator for one slice of the actions (`Keys`). */
export type ExpenseActionCreator<Keys extends keyof ExpenseState> =
  StateCreator<ExpenseState, [], [], Pick<ExpenseState, Keys>>;
