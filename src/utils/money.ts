import type { ExpenseDto } from "../types";

/** EUR in `locale` (the app language's, `useI18n().locale`). */
export function formatCurrency(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export interface BalanceDescription {
  amount: string;
  /** Dictionary key; render with `t(labelKey)`. */
  labelKey: "balance.getsBack" | "balance.owes" | "balance.settledUp";
  tone: "success" | "error" | "muted";
}

// Sign + words carry the meaning; colour only reinforces it (design §3.1).
export function describeBalance(
  netBalance: number,
  locale: string,
): BalanceDescription {
  const cents = Math.round(netBalance * 100);
  const formatted = formatCurrency(Math.abs(cents) / 100, locale);
  if (cents > 0)
    return {
      amount: `+${formatted}`,
      labelKey: "balance.getsBack",
      tone: "success",
    };
  if (cents < 0)
    return {
      amount: `\u2212${formatted}`,
      labelKey: "balance.owes",
      tone: "error",
    };
  return { amount: formatted, labelKey: "balance.settledUp", tone: "muted" };
}

/** Open (unsettled) amounts across `expenses` from `userId`'s point of view. */
export function summarizeBalances(
  expenses: Pick<ExpenseDto, "paidByUserId" | "splits">[],
  userId: string,
): { youAreOwed: number; youOwe: number } {
  let owedCents = 0;
  let oweCents = 0;
  for (const expense of expenses) {
    for (const split of expense.splits) {
      if (split.isSettled || split.userId === expense.paidByUserId) continue;
      const cents = Math.round(split.amountOwed * 100);
      if (expense.paidByUserId === userId) owedCents += cents;
      else if (split.userId === userId) oweCents += cents;
    }
  }
  return { youAreOwed: owedCents / 100, youOwe: oweCents / 100 };
}
