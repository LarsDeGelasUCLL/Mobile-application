import { useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  Card,
  ConfirmDialog,
  EmptyState,
  FeedbackBanner,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonCard,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import { ExpenseSummaryCard } from "../../../src/features/expenses/components/ExpenseSummaryCard";
import { SplitRow } from "../../../src/features/expenses/components/SplitRow";
import {
  canManageExpense,
  canSettleSplit,
} from "../../../src/features/expenses/expensePermissions";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const selectedExpense = useExpenseStore((state) => state.selectedExpense);
  const fetchExpenseDetail = useExpenseStore(
    (state) => state.fetchExpenseDetail,
  );
  const fetchGroupExpensesAndBalances = useExpenseStore(
    (state) => state.fetchGroupExpensesAndBalances,
  );
  const toggleSettleSplit = useExpenseStore((state) => state.toggleSettleSplit);
  const removeExpense = useExpenseStore((state) => state.removeExpense);
  const clearExpenseError = useExpenseStore((state) => state.clearError);
  const groups = useGroupStore((state) => state.groups);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const clearGroupError = useGroupStore((state) => state.clearError);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletedGroupId, setDeletedGroupId] = useState<string | null>(null);

  const expense = selectedExpense?.id === expenseId ? selectedExpense : null;
  const canManage = canManageExpense(user, expense, groups);
  const isLoading = expenseLoading || groupLoading;

  const loadExpense = useCallback(async () => {
    if (!expenseId) return;
    clearExpenseError();
    clearGroupError();
    try {
      await fetchExpenseDetail(expenseId);
      const loadedExpense = useExpenseStore.getState().selectedExpense;
      if (loadedExpense?.groupId && userId) {
        await fetchGroupsAndInvites(userId);
        await fetchGroupExpensesAndBalances(loadedExpense.groupId);
      }
    } catch {
      // The stores expose load failures for the retry banner.
    }
  }, [
    clearExpenseError,
    clearGroupError,
    expenseId,
    fetchExpenseDetail,
    fetchGroupExpensesAndBalances,
    fetchGroupsAndInvites,
    userId,
  ]);

  useEffect(() => {
    void loadExpense();
  }, [loadExpense]);

  const retry = async () => {
    if (expense?.id) {
      await loadExpense();
      return;
    }
    const groupId = deletedGroupId;
    if (groupId) {
      clearExpenseError();
      try {
        await fetchGroupExpensesAndBalances(groupId);
      } catch {
        // The expense store keeps the retryable balance error.
      }
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    clearExpenseError();
    try {
      await removeExpense(expense.id, expense.groupId);
      if (useExpenseStore.getState().error) {
        setDeletedGroupId(expense.groupId);
        setConfirmDelete(false);
        return;
      }
      if (expense.groupId) {
        router.replace({
          pathname: "/group/[groupId]",
          params: { groupId: expense.groupId },
        });
      } else {
        router.replace("/expenses");
      }
    } catch {
      setConfirmDelete(false);
    }
  };

  const error = expenseError ?? groupError;
  const navigateBack = () => {
    const groupId = expense?.groupId ?? deletedGroupId;
    goBackOr(
      groupId
        ? { pathname: "/group/[groupId]", params: { groupId } }
        : "/expenses",
    );
  };

  return (
    <Screen
      padding="lg"
      refreshing={isLoading}
      onRefresh={() => void loadExpense()}
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Expense details"
          onBack={navigateBack}
          actions={
            expense && canManage ? (
              <IconButton
                icon="create-outline"
                accessibilityLabel="Edit expense"
                onPress={() =>
                  router.push({
                    pathname: "/expense/edit/[expenseId]",
                    params: { expenseId: expense.id },
                  })
                }
                testID="edit-expense-button"
              />
            ) : undefined
          }
          testID="expense-detail-header"
        />

        {error ? (
          <FeedbackBanner
            tone="error"
            message={error}
            onRetry={() => void retry()}
            isRetrying={isLoading}
            retryTestID="expense-detail-retry-button"
            testID="expense-detail-error"
          />
        ) : null}

        {expenseLoading && !expense ? (
          <SkeletonCard
            lines={[
              { height: 24, width: "65%" },
              { height: 18, width: "45%" },
              { height: 18, width: "80%" },
            ]}
          />
        ) : !expense ? (
          <EmptyState
            title={deletedGroupId ? "Expense deleted" : "Expense unavailable"}
            description={
              deletedGroupId
                ? "The expense was deleted, but group balances still need to be refreshed."
                : "This expense could not be found or you do not have access to it."
            }
            action={
              <StyledButton
                label="Go back"
                onPress={navigateBack}
                variant="secondary"
              />
            }
          />
        ) : (
          <>
            <ExpenseSummaryCard
              expense={expense}
              testID="expense-detail-summary"
            />

            <Stack gap="sm">
              <SectionHeader title="Split breakdown" variant="title" />
              {expense.splits.map((split) => (
                <SplitRow
                  key={split.id}
                  split={split}
                  isPayer={split.userId === expense.paidByUserId}
                  canSettle={canSettleSplit(user, expense, split)}
                  isLoading={expenseLoading}
                  onToggleSettled={() =>
                    void toggleSettleSplit(
                      split.id,
                      !split.isSettled,
                      expense.groupId,
                    ).catch(() => undefined)
                  }
                />
              ))}
            </Stack>

            {canManage ? (
              <Card flush>
                <ListRow
                  icon="trash-outline"
                  label="Delete expense"
                  onPress={() => setConfirmDelete(true)}
                  destructive
                  testID="delete-expense-row"
                />
              </Card>
            ) : null}
            <ConfirmDialog
              visible={confirmDelete}
              title={`Delete '${expense.title}'?`}
              message="This cannot be undone."
              confirmLabel="Delete expense"
              onConfirm={() => void handleDelete()}
              onCancel={() => setConfirmDelete(false)}
              isLoading={expenseLoading}
              testID="confirm-delete-expense"
            />
          </>
        )}
      </Stack>
    </Screen>
  );
}
