import type { PublicUserProfileDto } from "./User";

// Response DTO: public.expense_splits
export interface ExpenseSplitDto {
  id: string;
  expenseId: string;
  userId: string;
  amountOwed: number;
  isSettled: boolean;
  userProfile?: PublicUserProfileDto;
}

// Response DTO: public.expenses
export interface ExpenseDto {
  id: string;
  groupId: string | null; // null = individual expense, not linked to a group
  paidByUserId: string;
  title: string;
  amount: number;
  receiptUrl: string | null;
  recordCreated: string;
  paidByProfile?: PublicUserProfileDto;
  splits: ExpenseSplitDto[];
}

// Input DTO for creating an expense split
export interface CreateExpenseSplitInput {
  userId: string;
  amountOwed: number;
}

export interface UpdateExpenseDto {
  title: string;
  amount: number;
  receiptUrl?: string | null;
  splits: CreateExpenseSplitInput[];
}

// Request DTO for creating a new expense
export interface CreateExpenseDto {
  groupId: string | null;
  paidByUserId: string;
  title: string;
  amount: number;
  receiptUrl?: string | null;
  splits: CreateExpenseSplitInput[];
}

// Response DTO for the calculated final balance per user in a group
export interface UserBalanceDto {
  userId: string;
  displayName: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // Positive = user is owed money, Negative = user owes money
}
