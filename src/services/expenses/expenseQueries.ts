import type { ExpenseDto, PublicUserProfileDto } from "../../types";
import { enrichExpenses } from "./expenseEnrichment";
import { getGroupMembers, getUserActiveGroups } from "../groups";
import { assertCurrentUser } from "../authGuard";
import { supabase } from "../supabase";

/**
 * Everyone the user can add to a personal expense: the members of all their
 * groups plus anyone already in one of their personal expenses, each once.
 */
export async function getUserExpenseParticipants(
  userId: string,
  personalExpenses: ExpenseDto[],
): Promise<PublicUserProfileDto[]> {
  const groups = await getUserActiveGroups(userId);
  const membershipsByGroup = await Promise.all(
    groups.map(({ group }) => getGroupMembers(group.id)),
  );
  const participants = new Map<string, PublicUserProfileDto>();
  const addProfile = (profile?: PublicUserProfileDto) => {
    if (profile && !participants.has(profile.id)) {
      participants.set(profile.id, profile);
    }
  };

  for (const membership of membershipsByGroup.flat()) {
    addProfile(membership.userProfile);
  }
  for (const expense of personalExpenses) {
    addProfile(expense.paidByProfile);
    addProfile(expense.createdByProfile);
    for (const split of expense.splits) {
      addProfile(split.userProfile);
    }
  }

  return Array.from(participants.values());
}

/** A group's expenses, newest first. */
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

/** The user's personal (no group) expenses: paid by them or with a split for them, newest first. */
export async function getIndividualExpenses(
  userId: string,
): Promise<ExpenseDto[]> {
  await assertCurrentUser(userId);

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
  // RLS limits this to expenses the user can access; the filter below keeps
  // only the ones they paid or have a split in.
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

/** One expense with its splits and profiles. */
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
