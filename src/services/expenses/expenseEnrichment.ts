import type { ExpenseDto, PublicUserProfileDto } from "../../types";
import type { Database } from "../../types/database.types";
import { mapRowToPublicUserProfileDto } from "../profiles/profileMappers";
import {
  mapRowToExpenseDto,
  mapRowToExpenseSplitDto,
} from "./expenseMappers";
import { supabase } from "../supabase";

export async function enrichExpenses(
  expenseRows: Database["public"]["Tables"]["expenses"]["Row"][],
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

  const { data: profilesData, error: profilesError } =
    userIds.size > 0
      ? await supabase
          .from("user_profiles")
          .select("id, display_name, profile_picture_url, custom_bio, record_created")
          .in("id", [...userIds])
      : { data: [], error: null };
  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileMap = new Map<string, PublicUserProfileDto>();
  for (const profileRow of profilesData ?? []) {
    const profile = mapRowToPublicUserProfileDto(profileRow);
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
