import type { UserBalanceDto } from "../../types";
import { getGroupExpenses } from "./expenseQueries";

export async function calculateGroupBalances(
  groupId: string,
): Promise<UserBalanceDto[]> {
  const expenses = await getGroupExpenses(groupId);
  const balances = new Map<string, UserBalanceDto>();

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
