import type {
  CreateExpenseDto,
  ExpenseDto,
  ExpenseSplitDto,
} from "../../types";
import { enrichExpenses } from "./expenseEnrichment";
import { mapRowToExpenseSplitDto } from "./expenseMappers";
import { supabase } from "../supabase";

export {
  mapRowToExpenseDto,
  mapRowToExpenseSplitDto,
} from "./expenseMappers";
export {
  getExpenseById,
  getGroupExpenses,
  getIndividualExpenses,
} from "./expenseQueries";
export { calculateGroupBalances } from "./expenseBalanceService";

export async function createExpense(
  payload: CreateExpenseDto,
): Promise<ExpenseDto> {
  const { data: createdExpense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      group_id: payload.groupId,
      paid_by_user_id: payload.paidByUserId,
      title: payload.title.trim(),
      amount: payload.amount,
      receipt_url: payload.receiptUrl ?? null,
    })
    .select("*")
    .single();

  if (expenseError || !createdExpense) {
    throw new Error(expenseError?.message ?? "Could not save expense.");
  }

  if (payload.splits.length > 0) {
    const splitsToInsert = payload.splits.map((split) => ({
      expense_id: createdExpense.id,
      user_id: split.userId,
      amount_owed: split.amountOwed,
      is_settled: split.userId === payload.paidByUserId,
    }));
    const { error: splitsError } = await supabase
      .from("expense_splits")
      .insert(splitsToInsert);

    if (splitsError) {
      throw new Error(splitsError.message);
    }
  }

  const [expense] = await enrichExpenses([createdExpense]);
  return expense;
}

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

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    throw new Error(error.message);
  }
}
