import { supabase } from "./supabase";
import type {
  ExpenseDto,
  ExpenseSplitDto,
  CreateExpenseDto,
  UserBalanceDto,
  UserProfileDto,
} from "../types";
import { mapRowToUserProfileDto } from "./profileService";

export function mapRowToExpenseSplitDto(
  row: Record<string, unknown>,
  profile?: UserProfileDto,
): ExpenseSplitDto {
  return {
    id: String(row.id ?? ""),
    expenseId: String(row.expense_id ?? ""),
    userId: String(row.user_id ?? ""),
    amountOwed: Number(row.amount_owed ?? 0),
    isSettled: Boolean(row.is_settled ?? false),
    userProfile: profile,
  };
}

export function mapRowToExpenseDto(
  row: Record<string, unknown>,
  paidByProfile?: UserProfileDto,
  splits: ExpenseSplitDto[] = [],
): ExpenseDto {
  return {
    id: String(row.id ?? ""),
    groupId: typeof row.group_id === "string" ? row.group_id : null,
    paidByUserId: String(row.paid_by_user_id ?? ""),
    title: String(row.title ?? ""),
    amount: Number(row.amount ?? 0),
    receiptUrl: typeof row.receipt_url === "string" ? row.receipt_url : null,
    recordCreated: String(row.record_created ?? ""),
    paidByProfile,
    splits,
  };
}

// Enrich a list of expenses with all splits and user profiles
async function enrichExpenses(
  expenseRows: Record<string, unknown>[],
): Promise<ExpenseDto[]> {
  if (expenseRows.length === 0) return [];

  const expenseIds = expenseRows.map((e) => String(e.id));
  const { data: splitRows, error: splitError } = await supabase
    .from("expense_splits")
    .select("*")
    .in("expense_id", expenseIds);

  if (splitError) {
    throw new Error(splitError.message);
  }

  const userIdsSet = new Set<string>();
  for (const exp of expenseRows) {
    if (typeof exp.paid_by_user_id === "string") {
      userIdsSet.add(exp.paid_by_user_id);
    }
  }
  for (const sp of splitRows ?? []) {
    if (typeof sp.user_id === "string") {
      userIdsSet.add(sp.user_id);
    }
  }

  const userIds = Array.from(userIdsSet);
  const { data: profilesData } =
    userIds.length > 0
      ? await supabase.from("user_profiles").select("*").in("id", userIds)
      : { data: [] };

  const profileMap = new Map<string, UserProfileDto>();
  for (const p of profilesData ?? []) {
    const dto = mapRowToUserProfileDto(p);
    profileMap.set(dto.id, dto);
  }

  return expenseRows.map((expRow) => {
    const expId = String(expRow.id);
    const matchingSplits = (splitRows ?? [])
      .filter((s) => String(s.expense_id) === expId)
      .map((s) =>
        mapRowToExpenseSplitDto(s, profileMap.get(String(s.user_id))),
      );

    const payerProfile = profileMap.get(String(expRow.paid_by_user_id));
    return mapRowToExpenseDto(expRow, payerProfile, matchingSplits);
  });
}

// Endpoint 1: Create a new expense (for a group or between individuals)
export async function createExpense(
  payload: CreateExpenseDto,
): Promise<ExpenseDto> {
  const { data: createdExpense, error: expError } = await supabase
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

  if (expError || !createdExpense) {
    throw new Error(expError?.message ?? "Could not save expense.");
  }

  if (payload.splits.length > 0) {
    const splitsToInsert = payload.splits.map((s) => ({
      expense_id: createdExpense.id,
      user_id: s.userId,
      amount_owed: s.amountOwed,
      is_settled: s.userId === payload.paidByUserId,
    }));

    const { error: splitsError } = await supabase
      .from("expense_splits")
      .insert(splitsToInsert);

    if (splitsError) {
      throw new Error(splitsError.message);
    }
  }

  const enriched = await enrichExpenses([createdExpense]);
  return enriched[0];
}

// Endpoint 2: Get all expenses for a specific group
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

// Endpoint 3: Get all of a user's individual expenses (not associated with a group)
export async function getIndividualExpenses(
  userId: string,
): Promise<ExpenseDto[]> {
  const { data: splitMatches } = await supabase
    .from("expense_splits")
    .select("expense_id")
    .eq("user_id", userId);

  const splitExpenseIds = (splitMatches ?? []).map((s) => String(s.expense_id));

  const { data: paidByMe, error } = await supabase
    .from("expenses")
    .select("*")
    .is("group_id", null)
    .order("record_created", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const relevantExpenses = (paidByMe ?? []).filter(
    (exp) =>
      String(exp.paid_by_user_id) === userId ||
      splitExpenseIds.includes(String(exp.id)),
  );

  return enrichExpenses(relevantExpenses);
}

// Endpoint 4: Get an expense by ID (for example, for details/[id].tsx)
export async function getExpenseById(expenseId: string): Promise<ExpenseDto> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Expense not found.");
  }

  const enriched = await enrichExpenses([data]);
  return enriched[0];
}

// Endpoint 5: Mark an outstanding expense split as settled or unsettled
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

// Endpoint 6: Delete an expense
export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);
  if (error) {
    throw new Error(error.message);
  }
}

// Endpoint 7: Calculate each group member's net balance (Splitwise / Tricount logic)
export async function calculateGroupBalances(
  groupId: string,
): Promise<UserBalanceDto[]> {
  const expenses = await getGroupExpenses(groupId);
  const balancesMap = new Map<string, UserBalanceDto>();

  const ensureUserEntry = (
    userId: string,
    displayName: string,
  ): UserBalanceDto => {
    const existing = balancesMap.get(userId);
    if (existing) return existing;
    const fresh: UserBalanceDto = {
      userId,
      displayName,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    };
    balancesMap.set(userId, fresh);
    return fresh;
  };

  for (const exp of expenses) {
    const payerName = exp.paidByProfile?.displayName ?? "Unknown";
    const payerEntry = ensureUserEntry(exp.paidByUserId, payerName);

    for (const split of exp.splits) {
      if (split.isSettled || split.userId === exp.paidByUserId) {
        continue;
      }

      const debtorName = split.userProfile?.displayName ?? "Unknown";
      const debtorEntry = ensureUserEntry(split.userId, debtorName);

      // The payer is owed this amount (+); the debtor still owes it (-)
      payerEntry.totalPaid += split.amountOwed;
      payerEntry.netBalance += split.amountOwed;

      debtorEntry.totalOwed += split.amountOwed;
      debtorEntry.netBalance -= split.amountOwed;
    }
  }

  return Array.from(balancesMap.values());
}
