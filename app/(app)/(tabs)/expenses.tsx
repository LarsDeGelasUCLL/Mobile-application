import { useCallback, useEffect } from "react";
import { router } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import {
  CardList,
  EmptyState,
  FeedbackBanner,
  Screen,
  SkeletonCard,
  Stack,
  StyledButton,
  Text,
} from "../../../src/components/primitives";
import { ExpenseRow } from "../../../src/features/expenses/components/ExpenseRow";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";

export default function ExpensesScreen() {
  const user = useAuthStore((state) => state.user);
  const { expenses, isLoading, error, fetchIndividualExpenses, clearError } =
    useExpenseStore(
      useShallow((state) => ({
        expenses: state.individualExpenses,
        isLoading: state.isLoading,
        error: state.error,
        fetchIndividualExpenses: state.fetchIndividualExpenses,
        clearError: state.clearError,
      })),
    );

  const loadExpenses = useCallback(async () => {
    if (!user?.id) return;
    clearError();
    try {
      await fetchIndividualExpenses(user.id);
    } catch {
      // The expense store exposes the load failure for the retry banner.
    }
  }, [clearError, fetchIndividualExpenses, user?.id]);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  return (
    <Screen
      padding="md"
      refreshing={isLoading}
      onRefresh={() => void loadExpenses()}
      footer={
        <StyledButton
          label="Add expense"
          onPress={() => router.push("/expense/create")}
          testID="create-personal-expense-button"
        />
      }
      testID="expenses-screen"
    >
      <Stack gap="md">
        <Stack gap="none">
          <Text size="lg" weight="bold">
            Personal expenses
          </Text>
          <Text size="sm" tone="muted">
            Costs outside a group, shared with anyone you know.
          </Text>
        </Stack>

        {error ? (
          <FeedbackBanner
            tone="error"
            message={error}
            onRetry={() => void loadExpenses()}
            isRetrying={isLoading}
            retryTestID="personal-expenses-retry-button"
            testID="personal-expenses-error"
          />
        ) : null}

        {error && expenses.length === 0 ? null : isLoading &&
          expenses.length === 0 ? (
          <SkeletonCard
            lines={[
              { height: 22, width: "60%" },
              { height: 16, width: "85%" },
              { height: 16, width: "40%" },
            ]}
          />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No personal expenses yet"
            description="Add an expense to start tracking a cost or a shared split."
          />
        ) : (
          <CardList>
            {expenses.map((expense) => (
              <ExpenseRow key={expense.id} expense={expense} />
            ))}
          </CardList>
        )}
      </Stack>
    </Screen>
  );
}
