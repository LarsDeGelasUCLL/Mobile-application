import { SectionHeader, Stack } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { SplitRow } from "./SplitRow";
import type { ExpenseDto, ExpenseSplitDto } from "../../../types";

interface SplitBreakdownProps {
  expense: Pick<ExpenseDto, "paidByUserId" | "splits">;
  canSettle: (split: ExpenseSplitDto) => boolean;
  isLoading: boolean;
  onToggleSettled: (split: ExpenseSplitDto) => void;
  testID?: string;
}

/** "Split breakdown": one `SplitRow` per share of the expense. */
export function SplitBreakdown({
  expense,
  canSettle,
  isLoading,
  onToggleSettled,
  testID,
}: SplitBreakdownProps) {
  const { t } = useI18n();
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title={t("expenses.split.title")} variant="title" />
      {expense.splits.map((split) => (
        <SplitRow
          key={split.id}
          split={split}
          isPayer={split.userId === expense.paidByUserId}
          canSettle={canSettle(split)}
          isLoading={isLoading}
          onToggleSettled={() => onToggleSettled(split)}
        />
      ))}
    </Stack>
  );
}
