import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
  FeedbackBanner,
  IconButton,
  ListRow,
  Row,
  Screen,
  ScreenHeader,
  Skeleton,
  Stack,
  StyledButton,
  Text,
} from "../../../src/components/primitives";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { formatCurrency } from "../../../src/utils/money";

export default function ExpenseDetailScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const user = useAuthStore((state) => state.user);
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
  const groupMembership = expense?.groupId
    ? groups.find((item) => item.group.id === expense.groupId)
    : undefined;
  const isGroupAdmin = groupMembership?.groupRole === "ADMIN";
  const canManage =
    !!user &&
    !!expense &&
    (isGroupAdmin ||
      expense.createdByUserId === user.id ||
      expense.paidByUserId === user.id);
  const isLoading = expenseLoading || groupLoading;

  const loadExpense = useCallback(async () => {
    if (!expenseId) return;
    clearExpenseError();
    clearGroupError();
    try {
      await fetchExpenseDetail(expenseId);
      const loadedExpense = useExpenseStore.getState().selectedExpense;
      if (loadedExpense?.groupId && user?.id) {
        await fetchGroupsAndInvites(user.id);
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
    user?.id,
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
    if (router.canGoBack()) {
      router.back();
      return;
    }

    const groupId = expense?.groupId ?? deletedGroupId;
    if (groupId) {
      router.replace({
        pathname: "/group/[groupId]",
        params: { groupId },
      });
    } else {
      router.replace("/expenses");
    }
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
          <FeedbackBanner tone="error" testID="expense-detail-error">
            <Text size="sm" tone="error">
              {error}
            </Text>
            <StyledButton
              label="Retry"
              onPress={() => void retry()}
              variant="secondary"
              isLoading={isLoading}
              testID="expense-detail-retry-button"
            />
          </FeedbackBanner>
        ) : null}

        {expenseLoading && !expense ? (
          <Card>
            <Stack gap="sm">
              <Skeleton height={24} width="65%" />
              <Skeleton height={18} width="45%" />
              <Skeleton height={18} width="80%" />
            </Stack>
          </Card>
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
            <View testID="expense-detail-summary">
              <Card>
                <Stack gap="sm">
                  <Row justify="space-between" align="center">
                    <Text size="lg" weight="bold">
                      {expense.title}
                    </Text>
                    <Badge
                      label={expense.groupId ? "Group expense" : "Personal"}
                    />
                  </Row>
                  <Text size="xxl" weight="bold">
                    {formatCurrency(expense.amount)}
                  </Text>
                  <Text size="sm" tone="muted">
                    Paid by{" "}
                    {expense.paidByProfile?.displayName ?? "A participant"}
                  </Text>
                  <Text size="sm" tone="muted">
                    Created by{" "}
                    {expense.createdByProfile?.displayName ??
                      expense.paidByProfile?.displayName ??
                      "A participant"}
                  </Text>
                  <Text size="sm" tone="muted">
                    {new Date(expense.recordCreated).toLocaleString()}
                  </Text>
                  {expense.receiptUrl ? (
                    <Text size="sm" tone="muted">
                      Receipt: {expense.receiptUrl}
                    </Text>
                  ) : null}
                </Stack>
              </Card>
            </View>

            <Stack gap="sm">
              <Text size="lg" weight="bold">
                Split breakdown
              </Text>
              {expense.splits.map((split) => {
                const isPayer = split.userId === expense.paidByUserId;
                const canSettle =
                  !!user &&
                  !isPayer &&
                  (split.userId === user.id ||
                    expense.paidByUserId === user.id);
                return (
                  <Card key={split.id}>
                    <Row justify="space-between" align="center">
                      <Stack gap="none" flex={1}>
                        <Text weight="medium">
                          {split.userProfile?.displayName ?? "Participant"}
                          {isPayer ? " (payer)" : ""}
                        </Text>
                        <Text size="sm" tone="muted">
                          {split.isSettled ? "Settled" : "Not settled"}
                        </Text>
                      </Stack>
                      <Stack gap="sm" align="flex-end">
                        <Text weight="bold">
                          {formatCurrency(split.amountOwed)}
                        </Text>
                        {canSettle ? (
                          <StyledButton
                            label={split.isSettled ? "Unsettle" : "Settle"}
                            onPress={() =>
                              void toggleSettleSplit(
                                split.id,
                                !split.isSettled,
                                expense.groupId,
                              ).catch(() => undefined)
                            }
                            variant="secondary"
                            isLoading={expenseLoading}
                            testID={`settle-split-${split.id}`}
                          />
                        ) : null}
                      </Stack>
                    </Row>
                  </Card>
                );
              })}
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
