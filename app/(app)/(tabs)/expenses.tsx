import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Badge,
  Card,
  EmptyState,
  FeedbackBanner,
  Row,
  Screen,
  Skeleton,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { colors } from "../../../src/theme/colors";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function ExpensesScreen() {
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
      padding="lg"
      refreshing={isLoading}
      onRefresh={() => void loadExpenses()}
    >
      <View style={styles.container} testID="expenses-screen">
        <Stack gap="lg">
          <Row justify="space-between" align="center">
            <Stack gap="none" flex={1}>
              <Text size="xl" weight="bold">
                Personal expenses
              </Text>
              <Text size="sm" color={colors.muted}>
                Hi {user?.displayName ?? "there"}, keep your costs in one place.
              </Text>
            </Stack>
            <View style={styles.createButton}>
              <StyledButton
                label="Add expense"
                onPress={() => router.push("/expense/create")}
                testID="create-personal-expense-button"
              />
            </View>
          </Row>

          <Row justify="space-between" align="center">
            <Text size="lg" weight="bold">
              Your expenses
            </Text>
            <Badge
              label={`${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`}
            />
          </Row>

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
              title="No personal expenses yet"
              description="Create an expense to start tracking a cost or a shared split."
              action={
                <StyledButton
                  label="Add expense"
                  onPress={() => router.push("/expense/create")}
                  testID="empty-create-expense-button"
                />
              }
            />
          ) : (
            <Stack gap="sm">
              {expenses.map((expense) => (
                <Card
                  key={expense.id}
                  onPress={() =>
                    router.push({
                      pathname: "/expense/[expenseId]",
                      params: { expenseId: expense.id },
                    })
                  }
                >
                  <Row justify="space-between" align="center">
                    <Stack gap="none" flex={1}>
                      <Text weight="bold">{expense.title}</Text>
                      <Text size="sm" color={colors.muted}>
                        Paid by{" "}
                        {expense.paidByProfile?.displayName ?? "A participant"}
                        {" · "}
                        {expense.splits.length}{" "}
                        {expense.splits.length === 1 ? "share" : "shares"}
                      </Text>
                    </Stack>
                    <Text weight="bold">{formatCurrency(expense.amount)}</Text>
                  </Row>
                </Card>
              ))}
            </Stack>
          )}

          <StyledButton
            label="Browse groups"
            onPress={() => router.push("/groups")}
            variant="secondary"
          />
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createButton: {
    width: 128,
  },
});
