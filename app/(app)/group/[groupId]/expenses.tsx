import { FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Divider,
  EmptyState,
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
  Text,
} from "../../../../src/components/primitives";
import { ExpenseRow } from "../../../../src/features/expenses/components/ExpenseRow";
import { useGroupDetail } from "../../../../src/features/groups/useGroupDetail";
import { makeStyles } from "../../../../src/theme/ThemeProvider";

export default function GroupExpensesScreen() {
  const styles = useStyles();
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
            router.canGoBack()
              ? router.back()
              : router.replace({
                  pathname: "/group/[groupId]",
                  params: { groupId },
                })
          }
          testID="group-expenses-header"
        />
        {expensesError ? (
          <FeedbackBanner tone="error" testID="group-expenses-error">
            <Text size="sm" tone="error">
              {expensesError}
            </Text>
            <StyledButton
              label="Retry"
              onPress={retryExpenses}
              variant="secondary"
              isLoading={expensesLoading}
              testID="group-expenses-retry-button"
            />
          </FeedbackBanner>
        ) : null}
        <FlatList
          data={groupExpenses}
          keyExtractor={(expense) => expense.id}
          renderItem={({ item }) => <ExpenseRow expense={item} />}
          ItemSeparatorComponent={Divider}
          refreshing={expensesLoading}
          onRefresh={() => void reload()}
          style={groupExpenses.length > 0 ? styles.list : undefined}
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

const useStyles = makeStyles((t) => ({
  // Card look; flexGrow 0 so a short list does not stretch the border.
  list: {
    flexGrow: 0,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
  },
}));
