import {
  CardList,
  EmptyState,
  ListRow,
  SectionHeader,
  SkeletonCard,
  Stack,
} from "../../../components/primitives";
import { ExpenseRow } from "../../expenses/components/ExpenseRow";
import type { ExpenseDto } from "../../../types";

const RECENT_EXPENSES = 5;

interface RecentExpensesSectionProps {
  /** Newest first, as the store keeps them. */
  expenses: ExpenseDto[];
  isLoading: boolean;
  /** The page shows the load error in its banner. */
  hasError: boolean;
  onSeeAll: () => void;
  /** Gets the pressed expense's id. */
  onOpenExpense: (expenseId: string) => void;
  testID?: string;
}

/** "RECENT EXPENSES": skeleton, empty state, or the newest few plus "See all". */
export function RecentExpensesSection({
  testID,
  ...props
}: RecentExpensesSectionProps) {
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="RECENT EXPENSES" />
      <RecentExpensesBody {...props} />
    </Stack>
  );
}

function RecentExpensesBody({
  expenses,
  isLoading,
  hasError,
  onSeeAll,
  onOpenExpense,
}: Omit<RecentExpensesSectionProps, "testID">) {
  if (hasError && expenses.length === 0) return null;
  if (isLoading && expenses.length === 0) {
    return (
      <SkeletonCard
        lines={[
          { height: 22, width: "55%" },
          { height: 16, width: "80%" },
        ]}
      />
    );
  }
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="No group expenses"
        description="Add an expense to start tracking shared costs."
      />
    );
  }
  return (
    <CardList>
      {expenses.slice(0, RECENT_EXPENSES).map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} onOpen={onOpenExpense} />
      ))}
      {expenses.length > RECENT_EXPENSES ? (
        <ListRow
          label={`See all ${expenses.length} expenses`}
          onPress={onSeeAll}
          testID="group-see-all-expenses"
        />
      ) : null}
    </CardList>
  );
}
