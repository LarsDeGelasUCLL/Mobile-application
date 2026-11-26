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
import { useI18n } from "../../../../src/i18n";
import { ExpenseRow } from "../../../../src/features/expenses/components/ExpenseRow";
import { openExpense } from "../../../../src/features/expenses/openExpense";
import { useGroupDetail } from "../../../../src/features/groups/useGroupDetail";

/** All expenses of a group (`/group/:groupId/expenses`). */
export default function GroupExpensesScreen() {
  const { t } = useI18n();
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
            label={t("common.addExpense")}
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
          title={t("groups.expenses.title")}
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
          renderItem={({ item }) => (
            <ExpenseRow expense={item} onOpen={openExpense} />
          )}
          refreshing={expensesLoading}
          onRefresh={() => void reload()}
          ListEmptyComponent={
            expensesLoading || expensesError ? undefined : (
              <EmptyState
                icon="receipt-outline"
                title={t("groups.expenses.emptyTitle")}
                description={t("groups.expenses.emptyText")}
              />
            )
          }
          testID="group-expenses-list"
        />
      </Stack>
    </Screen>
  );
}
