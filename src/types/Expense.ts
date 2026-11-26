import type { PublicUserProfileDto } from "./User";

// Response DTO: public.expense_splits. One person's share of an expense.
export interface ExpenseSplitDto {
  id: string;
  expenseId: string;
  userId: string;
  amountOwed: number;
  isSettled: boolean;
  userProfile?: PublicUserProfileDto; // filled in when the query joins the profile
}

// Response DTO: public.expenses
export interface ExpenseDto {
  id: string;
  groupId: string | null; // null = individual expense, not linked to a group
  paidByUserId: string;
  createdByUserId: string;
  title: string;
  amount: number;
  receiptUrl: string | null;
  recordCreated: string;
  paidByProfile?: PublicUserProfileDto;
  createdByProfile?: PublicUserProfileDto;
  splits: ExpenseSplitDto[];
}

// Input DTO for one split when creating or updating an expense
export interface CreateExpenseSplitInput {
  userId: string;
  amountOwed: number;
}

// Request DTO for editing an expense; the splits replace the old ones
export interface UpdateExpenseDto {
  groupId: string | null;
  paidByUserId: string;
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
  netBalance: number; // positive = user is owed money, negative = user owes money
}
