import { router } from "expo-router";

/** Opens an expense's detail page; what an `ExpenseRow` press does. */
export function openExpense(expenseId: string): void {
  router.push({ pathname: "/expense/[expenseId]", params: { expenseId } });
}
