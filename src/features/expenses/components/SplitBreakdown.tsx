import { SectionHeader, Stack } from "../../../components/primitives";
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
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="Split breakdown" variant="title" />
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
