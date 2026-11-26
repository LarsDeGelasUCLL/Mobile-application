import {
  CardList,
  EmptyState,
  FeedbackBanner,
  SectionHeader,
  SkeletonCard,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import type { ExpenseDto } from "../../../types";
import { ExpenseRow } from "../../expenses/components/ExpenseRow";

const RECENT_EXPENSES = 3;

interface HomeRecentExpensesProps {
  /** Newest first, as the store keeps them. */
  expenses: ExpenseDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  /** Shown as "See all" when there are more than fit. */
  onSeeAll: () => void;
  onAddExpense: () => void;
  /** Gets the pressed expense's id. */
  onOpenExpense: (expenseId: string) => void;
  testID?: string;
}

/** "Recent expenses": title, load error with retry, then the body. */
export function HomeRecentExpenses({
  expenses,
  isLoading,
  error,
  onRetry,
  onSeeAll,
  onAddExpense,
  onOpenExpense,
  testID,
}: HomeRecentExpensesProps) {
  const { t } = useI18n();
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader
        title={t("home.recent.title")}
        variant="title"
        onAction={expenses.length > RECENT_EXPENSES ? onSeeAll : undefined}
        actionTestID="home-expenses-see-all"
      />
      {error ? (
        <FeedbackBanner
          tone="error"
          message={error}
          onRetry={onRetry}
          retryLabel={t("common.retryExpenses")}
          isRetrying={isLoading}
          retryTestID="home-expenses-retry-button"
          testID="home-expenses-error"
        />
      ) : null}
      <RecentExpensesBody
        expenses={expenses}
        isLoading={isLoading}
        hasError={!!error}
        onAddExpense={onAddExpense}
        onOpenExpense={onOpenExpense}
      />
    </Stack>
  );
}

/** Nothing (error, no expenses), skeleton, empty state, or the newest few. */
function RecentExpensesBody({
  expenses,
  isLoading,
  hasError,
  onAddExpense,
  onOpenExpense,
}: Pick<
  HomeRecentExpensesProps,
  "expenses" | "isLoading" | "onAddExpense" | "onOpenExpense"
> & {
  hasError: boolean;
}) {
  const { t } = useI18n();
  if (hasError && expenses.length === 0) return null;
  if (isLoading && expenses.length === 0) {
    return (
      <SkeletonCard
        lines={[
          { height: 22, width: "60%" },
          { height: 16, width: "85%" },
        ]}
      />
    );
  }
  if (expenses.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title={t("home.recent.emptyTitle")}
        description={t("home.recent.emptyText")}
        action={<StyledButton label={t("common.addExpense")} onPress={onAddExpense} />}
      />
    );
  }
  return (
    <CardList>
      {expenses.slice(0, RECENT_EXPENSES).map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} onOpen={onOpenExpense} />
      ))}
    </CardList>
  );
}
