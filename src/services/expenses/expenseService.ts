import type {
  CreateExpenseDto,
  ExpenseDto,
  ExpenseSplitDto,
  UpdateExpenseDto,
} from "../../types";
import type { Json } from "../../types/database.types";
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

function validateExpenseInput(
  amount: number,
  title: string,
  splits: { userId: string; amountOwed: number }[],
): void {
  const amountCents = Math.round(amount * 100);
  if (
    !title.trim() ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    Math.abs(amount * 100 - amountCents) > 1e-8
  ) {
    throw new Error("Expense title and a positive amount with cents are required.");
  }
  const splitUsers = new Set<string>();
  let totalCents = 0;
  for (const split of splits) {
    if (
      !split.userId ||
      !Number.isFinite(split.amountOwed) ||
      split.amountOwed < 0 ||
      Math.abs(split.amountOwed * 100 - Math.round(split.amountOwed * 100)) >
        1e-8
    ) {
      throw new Error("Split amounts must be nonnegative and have at most two decimals.");
    }
    if (splitUsers.has(split.userId)) {
      throw new Error("An expense cannot contain duplicate users in its splits.");
    }
    splitUsers.add(split.userId);
    totalCents += Math.round(split.amountOwed * 100);
  }
  if (totalCents !== amountCents) {
    throw new Error("Split amounts must equal the expense amount.");
  }
}

async function assertCurrentUser(userId: string): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || data.user.id !== userId) {
    throw new Error(error?.message ?? "The payer must be the current user.");
  }
}

export async function createExpense(
  payload: CreateExpenseDto,
): Promise<ExpenseDto> {
  validateExpenseInput(payload.amount, payload.title, payload.splits);
  await assertCurrentUser(payload.paidByUserId);
  const splits: Json = payload.splits.map((split) => ({
    userId: split.userId,
    amountOwed: split.amountOwed,
  }));
  const { data: createdExpense, error } = await supabase.rpc(
    "create_expense_with_splits",
    {
      _group_id: payload.groupId,
      _title: payload.title.trim(),
      _amount: payload.amount,
      _receipt_url: payload.receiptUrl ?? null,
      _splits: splits,
    },
  );
  if (error || !createdExpense) {
    throw new Error(error?.message ?? "Could not save expense.");
  }

  const [expense] = await enrichExpenses([createdExpense]);
  return expense;
}

export async function updateExpense(
  expenseId: string,
  payload: UpdateExpenseDto,
): Promise<ExpenseDto> {
  validateExpenseInput(payload.amount, payload.title, payload.splits);
  const splits: Json = payload.splits.map((split) => ({
    userId: split.userId,
    amountOwed: split.amountOwed,
  }));
  const { data: updatedExpense, error } = await supabase.rpc(
    "update_expense_with_splits",
    {
      _expense_id: expenseId,
      _title: payload.title.trim(),
      _amount: payload.amount,
      _receipt_url: payload.receiptUrl ?? null,
      _splits: splits,
    },
  );
  if (error || !updatedExpense) {
    throw new Error(error?.message ?? "Could not update expense.");
  }

  const [expense] = await enrichExpenses([updatedExpense]);
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
    .eq("id", expenseId)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }
}
