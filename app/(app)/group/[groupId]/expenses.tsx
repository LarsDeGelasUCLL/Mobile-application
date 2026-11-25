import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../../src/features/navigation/goBackOr";
import {
  CardFlatList,
  EmptyState,
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../../src/components/primitives";
import { ExpenseRow } from "../../../../src/features/expenses/components/ExpenseRow";
import { useGroupDetail } from "../../../../src/features/groups/useGroupDetail";

export default function GroupExpensesScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const {
    group,
    groupExpenses,
    expensesLoading,
    expensesError,
    reload,
    retryExpenses,
  } = useGroupDetail(groupId);

  // Not scrollable: the FlatList scrolls (no list nested in a ScrollView).
  return (
    <Screen
      padding="lg"
      scrollable={false}
      footer={
        group ? (
          <StyledButton
            label="Add expense"
            onPress={() =>
              router.push({ pathname: "/expense/create", params: { groupId } })
            }
            testID="group-expenses-add-button"
          />
        ) : undefined
      }
    >
      <Stack gap="lg" flex={1}>
        <ScreenHeader
          title="Expenses"
          subtitle={group?.name}
          onBack={() =>
            goBackOr({ pathname: "/group/[groupId]", params: { groupId } })
          }
          testID="group-expenses-header"
        />
        {expensesError ? (
          <FeedbackBanner
            tone="error"
            message={expensesError}
            onRetry={retryExpenses}
            isRetrying={expensesLoading}
            retryTestID="group-expenses-retry-button"
            testID="group-expenses-error"
          />
        ) : null}
        <CardFlatList
          data={groupExpenses}
          keyExtractor={(expense) => expense.id}
          renderItem={({ item }) => <ExpenseRow expense={item} />}
          refreshing={expensesLoading}
          onRefresh={() => void reload()}
          ListEmptyComponent={
            expensesLoading || expensesError ? undefined : (
              <EmptyState
                icon="receipt-outline"
                title="No group expenses"
                description="Add an expense to start tracking shared costs."
              />
            )
          }
          testID="group-expenses-list"
        />
      </Stack>
    </Screen>
  );
}
