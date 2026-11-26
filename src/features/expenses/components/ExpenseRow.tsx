import { ListRow } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { formatCurrency } from "../../../utils/money";
import type { ExpenseDto } from "../../../types";

interface ExpenseRowProps {
  expense: ExpenseDto;
  /** Gets the expense id; pages pass `openExpense`. */
  onOpen: (expenseId: string) => void;
}

/** One expense (group or personal): title, payer, amount; opens its detail. */
export function ExpenseRow({ expense, onOpen }: ExpenseRowProps) {
  const { t, locale } = useI18n();
  return (
    <ListRow
      icon="receipt-outline"
      label={expense.title}
      description={t("expenses.paidBy", {
        name:
          expense.paidByProfile?.displayName ??
          t("expenses.participantFallback"),
      })}
      value={formatCurrency(expense.amount, locale)}
      onPress={() => onOpen(expense.id)}
      testID={`expense-row-${expense.id}`}
    />
  );
}
