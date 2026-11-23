import { router } from "expo-router";
import { ListRow } from "../../../components/primitives";
import { formatCurrency } from "../../../utils/money";
import type { ExpenseDto } from "../../../types";

/** One expense (group or personal): title, payer, amount; opens its detail. */
export function ExpenseRow({ expense }: { expense: ExpenseDto }) {
  return (
    <ListRow
      icon="receipt-outline"
      label={expense.title}
      description={`Paid by ${expense.paidByProfile?.displayName ?? "A participant"}`}
      value={formatCurrency(expense.amount)}
      onPress={() =>
        router.push({
          pathname: "/expense/[expenseId]",
          params: { expenseId: expense.id },
        })
      }
      testID={`expense-row-${expense.id}`}
    />
  );
}
