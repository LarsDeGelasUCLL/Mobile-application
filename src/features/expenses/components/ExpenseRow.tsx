import { ListRow } from "../../../components/primitives";
import { formatCurrency } from "../../../utils/money";
import type { ExpenseDto } from "../../../types";

interface ExpenseRowProps {
  expense: ExpenseDto;
  /** Gets the expense id; pages pass `openExpense`. */
  onOpen: (expenseId: string) => void;
}

/** One expense (group or personal): title, payer, amount; opens its detail. */
export function ExpenseRow({ expense, onOpen }: ExpenseRowProps) {
  return (
    <ListRow
      icon="receipt-outline"
      label={expense.title}
      description={`Paid by ${expense.paidByProfile?.displayName ?? "A participant"}`}
      value={formatCurrency(expense.amount)}
      onPress={() => onOpen(expense.id)}
      testID={`expense-row-${expense.id}`}
    />
  );
}
