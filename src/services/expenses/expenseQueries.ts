import type { ExpenseDto } from "../../types";
import { enrichExpenses } from "./expenseEnrichment";
import { supabase } from "../supabase";

export async function getGroupExpenses(groupId: string): Promise<ExpenseDto[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("group_id", groupId)
    .order("record_created", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return enrichExpenses(data ?? []);
}

export async function getIndividualExpenses(
  userId: string,
): Promise<ExpenseDto[]> {
  const { data: splitMatches, error: splitError } = await supabase
    .from("expense_splits")
    .select("expense_id")
    .eq("user_id", userId);
  if (splitError) {
    throw new Error(splitError.message);
  }

  const splitExpenseIds = (splitMatches ?? []).map((split) =>
    String(split.expense_id),
  );
  const { data: paidByMe, error } = await supabase
    .from("expenses")
    .select("*")
    .is("group_id", null)
    .order("record_created", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const relevantExpenses = (paidByMe ?? []).filter(
    (expense) =>
      String(expense.paid_by_user_id) === userId ||
      splitExpenseIds.includes(String(expense.id)),
  );

  return enrichExpenses(relevantExpenses);
}

export async function getExpenseById(expenseId: string): Promise<ExpenseDto> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Expense not found.");
  }

  const [expense] = await enrichExpenses([data]);
  return expense;
}
