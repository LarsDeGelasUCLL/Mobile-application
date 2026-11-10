import type { ExpenseDto, UserProfileDto } from "../../types";
import { mapRowToUserProfileDto } from "../profiles/profileMappers";
import {
  mapRowToExpenseDto,
  mapRowToExpenseSplitDto,
} from "./expenseMappers";
import { supabase } from "../supabase";

export async function enrichExpenses(
  expenseRows: Record<string, unknown>[],
): Promise<ExpenseDto[]> {
  if (expenseRows.length === 0) return [];

  const expenseIds = expenseRows.map((expense) => String(expense.id));
  const { data: splitRows, error: splitError } = await supabase
    .from("expense_splits")
    .select("*")
    .in("expense_id", expenseIds);

  if (splitError) {
    throw new Error(splitError.message);
  }

  const userIds = new Set<string>();
  for (const expense of expenseRows) {
    if (typeof expense.paid_by_user_id === "string") {
      userIds.add(expense.paid_by_user_id);
    }
  }
  for (const split of splitRows ?? []) {
    if (typeof split.user_id === "string") {
      userIds.add(split.user_id);
    }
  }

  const { data: profilesData } =
    userIds.size > 0
      ? await supabase.from("user_profiles").select("*").in("id", [...userIds])
      : { data: [] };

  const profileMap = new Map<string, UserProfileDto>();
  for (const profileRow of profilesData ?? []) {
    const profile = mapRowToUserProfileDto(profileRow);
    profileMap.set(profile.id, profile);
  }

  return expenseRows.map((expenseRow) => {
    const expenseId = String(expenseRow.id);
    const splits = (splitRows ?? [])
      .filter((split) => String(split.expense_id) === expenseId)
      .map((split) =>
        mapRowToExpenseSplitDto(
          split,
          profileMap.get(String(split.user_id)),
        ),
      );

    return mapRowToExpenseDto(
      expenseRow,
      profileMap.get(String(expenseRow.paid_by_user_id)),
      splits,
    );
  });
}
