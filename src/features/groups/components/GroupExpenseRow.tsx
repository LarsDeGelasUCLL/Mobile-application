import { router } from "expo-router";
import { ListRow } from "../../../components/primitives";
import { formatCurrency } from "../../../utils/money";
import type { ExpenseDto } from "../../../types";

/** One group expense: title, payer, amount; opens the expense detail. */
export function GroupExpenseRow({ expense }: { expense: ExpenseDto }) {
  return (
    <ListRow
      icon="receipt-outline"
      label={expense.title}
      description={`Paid by ${expense.paidByProfile?.displayName ?? "Group member"}`}
      value={formatCurrency(expense.amount)}
      onPress={() =>
        router.push({
          pathname: "/expense/[expenseId]",
          params: { expenseId: expense.id },
        })
      }
      testID={`group-expense-${expense.id}`}
    />
  );
}
