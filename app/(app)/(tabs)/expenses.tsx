import { Fragment, useCallback, useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Card,
  Divider,
  EmptyState,
  FeedbackBanner,
  Screen,
  Skeleton,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { ExpenseRow } from "../../../src/features/expenses/components/ExpenseRow";
import { useTheme } from "../../../src/theme/ThemeProvider";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const expenses = useExpenseStore((state) => state.individualExpenses);
  const isLoading = useExpenseStore((state) => state.isLoading);
  const error = useExpenseStore((state) => state.error);
  const fetchIndividualExpenses = useExpenseStore(
    (state) => state.fetchIndividualExpenses,
  );
  const clearError = useExpenseStore((state) => state.clearError);

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
    >
      <View testID="expenses-screen">
        <Stack gap="md">
          <Stack gap="none">
            <Text size="lg" weight="bold">
              Personal expenses
            </Text>
            <Text size="sm" color={colors.textMuted}>
              Costs outside a group, shared with anyone you know.
            </Text>
          </Stack>

          {error ? (
            <FeedbackBanner tone="error" testID="personal-expenses-error">
              <Text size="sm" color={colors.error}>
                {error}
              </Text>
              <StyledButton
                label="Retry"
                onPress={() => void loadExpenses()}
                variant="secondary"
                isLoading={isLoading}
                testID="personal-expenses-retry-button"
              />
            </FeedbackBanner>
          ) : null}

          {error && expenses.length === 0 ? null : isLoading &&
            expenses.length === 0 ? (
            <Card>
              <Stack gap="sm">
                <Skeleton height={22} width="60%" />
                <Skeleton height={16} width="85%" />
                <Skeleton height={16} width="40%" />
              </Stack>
            </Card>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No personal expenses yet"
              description="Add an expense to start tracking a cost or a shared split."
            />
          ) : (
            <Card flush>
              {expenses.map((expense, index) => (
                <Fragment key={expense.id}>
                  {index > 0 ? <Divider /> : null}
                  <ExpenseRow expense={expense} />
                </Fragment>
              ))}
            </Card>
          )}
        </Stack>
      </View>
    </Screen>
  );
}
