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
import { useI18n } from "../../../src/i18n";
import { ExpenseRow } from "../../../src/features/expenses/components/ExpenseRow";
import { openExpense } from "../../../src/features/expenses/openExpense";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";

/** Expenses tab (`/expenses`): the user's personal expenses and a button to add one. */
export default function ExpensesScreen() {
  const { t } = useI18n();
  const userId = useAuthStore((state) => state.user?.id);
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
    if (!userId) return;
    clearError();
    try {
      await fetchIndividualExpenses(userId);
    } catch {
      // The expense store exposes the load failure for the retry banner.
    }
  }, [clearError, fetchIndividualExpenses, userId]);

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
          label={t("common.addExpense")}
          onPress={() => router.push("/expense/create")}
          testID="create-personal-expense-button"
        />
      }
      testID="expenses-screen"
    >
      <Stack gap="md">
        <Stack gap="none">
          <Text size="lg" weight="bold">
            {t("expenses.tab.title")}
          </Text>
          <Text size="sm" tone="muted">
            {t("expenses.tab.subtitle")}
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
            title={t("expenses.tab.emptyTitle")}
            description={t("expenses.tab.emptyText")}
          />
        ) : (
          <CardList>
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onOpen={openExpense}
              />
            ))}
          </CardList>
        )}
      </Stack>
    </Screen>
  );
}
