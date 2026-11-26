import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  Card,
  ConfirmDialog,
  FeedbackBanner,
  IconButton,
  ListRow,
  Screen,
  ScreenHeader,
  Stack,
} from "../../../src/components/primitives";
import { useI18n } from "../../../src/i18n";
import { ExpenseDetailSkeleton } from "../../../src/features/expenses/components/ExpenseDetailSkeleton";
import { ExpenseMissingState } from "../../../src/features/expenses/components/ExpenseMissingState";
import { ExpenseSummaryCard } from "../../../src/features/expenses/components/ExpenseSummaryCard";
import { SplitBreakdown } from "../../../src/features/expenses/components/SplitBreakdown";
import { useExpenseDetail } from "../../../src/features/expenses/useExpenseDetail";

/** Expense detail (`/expense/:expenseId`): summary, split breakdown with settle buttons, edit and delete. */
export default function ExpenseDetailScreen() {
  const { t } = useI18n();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const page = useExpenseDetail(expenseId);
  const { expense } = page;
  const navigateBack = () => {
    const groupId = expense?.groupId ?? page.deletedGroupId;
    goBackOr(
      groupId
        ? { pathname: "/group/[groupId]", params: { groupId } }
        : "/expenses",
    );
  };

  return (
    <Screen
      padding="lg"
      refreshing={page.isLoading}
      onRefresh={() => void page.reload()}
    >
      <Stack gap="lg">
        <ScreenHeader
          title={t("expenses.detail.title")}
          onBack={navigateBack}
          actions={
            expense && page.canManage ? (
              <IconButton
                icon="create-outline"
                accessibilityLabel={t("expenses.detail.edit")}
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

        {page.error ? (
          <FeedbackBanner
            tone="error"
            message={page.error}
            onRetry={() => void page.retry()}
            isRetrying={page.isLoading}
            retryTestID="expense-detail-retry-button"
            testID="expense-detail-error"
          />
        ) : null}

        {page.expenseLoading && !expense ? (
          <ExpenseDetailSkeleton />
        ) : !expense ? (
          <ExpenseMissingState
            deleted={!!page.deletedGroupId}
            onBack={navigateBack}
          />
        ) : (
          <>
            <ExpenseSummaryCard
              expense={expense}
              testID="expense-detail-summary"
            />
            <SplitBreakdown
              expense={expense}
              canSettle={page.canSettle}
              isLoading={page.expenseLoading}
              onToggleSettled={page.toggleSettled}
            />

            {page.canManage ? (
              <Card flush>
                <ListRow
                  icon="trash-outline"
                  label={t("expenses.detail.delete")}
                  onPress={() => page.setConfirmDelete(true)}
                  destructive
                  testID="delete-expense-row"
                />
              </Card>
            ) : null}
            <ConfirmDialog
              visible={page.confirmDelete}
              title={t("expenses.detail.deleteTitle", { title: expense.title })}
              message={t("expenses.detail.deleteMessage")}
              confirmLabel={t("expenses.detail.delete")}
              onConfirm={() => void page.deleteExpense()}
              onCancel={() => page.setConfirmDelete(false)}
              isLoading={page.expenseLoading}
              testID="confirm-delete-expense"
            />
          </>
        )}
      </Stack>
    </Screen>
  );
}
