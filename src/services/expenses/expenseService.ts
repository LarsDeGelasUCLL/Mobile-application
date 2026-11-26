import type {
  CreateExpenseDto,
  ExpenseDto,
  ExpenseSplitDto,
  UpdateExpenseDto,
} from "../../types";
import type { Json } from "../../types/database.types";
import { enrichExpenses } from "./expenseEnrichment";
import { mapRowToExpenseSplitDto } from "./expenseMappers";
import {
  normalizeReceiptUrl,
  validateExpensePayload,
} from "./expenseValidation";
import { supabase } from "../supabase";

// Expense writes. Also the entry point of the expenses service: the queries,
// mappers and balance calculation are re-exported from here.
export { mapRowToExpenseDto, mapRowToExpenseSplitDto } from "./expenseMappers";
export {
  getUserExpenseParticipants,
  getExpenseById,
  getGroupExpenses,
  getIndividualExpenses,
} from "./expenseQueries";
export { calculateGroupBalances } from "./expenseBalanceService";

/** The signed-in user's id; throws when signed out. */
async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error(
      error?.message ?? "You must be signed in to manage expenses.",
    );
  }
  return data.user.id;
}

/**
 * Validates the payload (same rules as the form) and creates the expense
 * and its splits in one RPC, so both are saved or neither.
 */
export async function createExpense(
  payload: CreateExpenseDto,
): Promise<ExpenseDto> {
  const currentUserId = await getCurrentUserId();
  validateExpensePayload(payload, currentUserId);
  const splits: Json = payload.splits.map((split) => ({
    userId: split.userId,
    amountOwed: split.amountOwed,
  }));
  const { data: createdExpense, error } = await supabase.rpc(
    "create_expense_with_splits",
    {
      _group_id: payload.groupId,
      _paid_by_user_id: payload.paidByUserId,
      _title: payload.title.trim(),
      _amount: payload.amount,
      _receipt_url: normalizeReceiptUrl(payload.receiptUrl),
      _splits: splits,
    },
  );
  if (error || !createdExpense) {
    throw new Error(error?.message ?? "Could not save expense.");
  }

  const [expense] = await enrichExpenses([createdExpense]);
  return expense;
}

/** Validates the payload and replaces the expense and its splits in one RPC. */
export async function updateExpense(
  expenseId: string,
  payload: UpdateExpenseDto,
): Promise<ExpenseDto> {
  const currentUserId = await getCurrentUserId();
  validateExpensePayload(payload, currentUserId);
  const splits: Json = payload.splits.map((split) => ({
    userId: split.userId,
    amountOwed: split.amountOwed,
  }));
  const { data: updatedExpense, error } = await supabase.rpc(
    "update_expense_with_splits",
    {
      _expense_id: expenseId,
      _paid_by_user_id: payload.paidByUserId,
      _title: payload.title.trim(),
      _amount: payload.amount,
      _receipt_url: normalizeReceiptUrl(payload.receiptUrl),
      _splits: splits,
    },
  );
  if (error || !updatedExpense) {
    throw new Error(error?.message ?? "Could not update expense.");
  }

  const [expense] = await enrichExpenses([updatedExpense]);
  return expense;
}

/**
 * Marks a split paid or unpaid. Only `is_settled` may change; the split user
 * or the payer may do it, but not on the payer's own split.
 */
export async function settleExpenseSplit(
  splitId: string,
  isSettled: boolean,
): Promise<ExpenseSplitDto> {
  const { data, error } = await supabase
    .from("expense_splits")
    .update({ is_settled: isSettled })
    .eq("id", splitId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update payment status.");
  }

  return mapRowToExpenseSplitDto(data);
}

/** Deletes an expense (payer, creator or group admin). `.select().single()` makes a blocked delete fail. */
export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }
}
