import type { ExpenseDto, UserBalanceDto } from "../../types";
import { getGroupExpenses } from "./expenseQueries";

/**
 * Who owes whom in a group, from the unsettled splits only. A payer's own
 * split is not a debt. `totalPaid` = what others still owe this user,
 * `totalOwed` = what this user still owes others. Pass `groupExpenses` when
 * they are already loaded to skip the fetch.
 */
export async function calculateGroupBalances(
  groupId: string,
  groupExpenses?: ExpenseDto[],
): Promise<UserBalanceDto[]> {
  const expenses = groupExpenses ?? (await getGroupExpenses(groupId));
  const balances = new Map<string, UserBalanceDto>();

  // The user's balance entry, created at zero on first use.
  const ensureUserEntry = (
    userId: string,
    displayName: string,
  ): UserBalanceDto => {
    const existing = balances.get(userId);
    if (existing) return existing;

    const balance: UserBalanceDto = {
      userId,
      displayName,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    };
    balances.set(userId, balance);
    return balance;
  };

  for (const expense of expenses) {
    const payer = ensureUserEntry(
      expense.paidByUserId,
      expense.paidByProfile?.displayName ?? "Unknown",
    );

    for (const split of expense.splits) {
      if (split.isSettled || split.userId === expense.paidByUserId) continue;

      const debtor = ensureUserEntry(
        split.userId,
        split.userProfile?.displayName ?? "Unknown",
      );
      payer.totalPaid += split.amountOwed;
      payer.netBalance += split.amountOwed;
      debtor.totalOwed += split.amountOwed;
      debtor.netBalance -= split.amountOwed;
    }
  }

  return Array.from(balances.values());
}
