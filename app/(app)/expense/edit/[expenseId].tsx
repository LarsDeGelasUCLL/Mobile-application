import { useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../../src/features/navigation/goBackOr";
import {
  EmptyState,
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../../src/components/primitives";
import { useI18n } from "../../../../src/i18n";
import {
  ExpenseForm,
  type ExpenseFormHandle,
} from "../../../../src/features/expenses/components/ExpenseForm";
import { ExpenseFormSkeleton } from "../../../../src/features/expenses/components/ExpenseFormSkeleton";
import { ExpenseMissingState } from "../../../../src/features/expenses/components/ExpenseMissingState";
import { useEditExpense } from "../../../../src/features/expenses/useEditExpense";

/** Edit expense (`/expense/edit/:expenseId`); only for users who may manage it. */
export default function EditExpenseScreen() {
  const { t } = useI18n();
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const formRef = useRef<ExpenseFormHandle>(null);
  const page = useEditExpense(expenseId);
  const { expense } = page;
  const isSaving = page.expenseLoading || page.groupLoading;
  const navigateBack = () =>
    goBackOr(
      expense
        ? {
            pathname: "/expense/[expenseId]",
            params: { expenseId: expense.id },
          }
        : "/expenses",
    );

  return (
    <Screen
      padding="lg"
      refreshing={page.participantsLoading}
      onRefresh={() => void page.reload()}
      footer={
        page.showForm ? (
          <StyledButton
            label={t("expenses.edit.save")}
            onPress={() => formRef.current?.submit()}
            isLoading={isSaving}
            testID="save-expense-button"
          />
        ) : undefined
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title={t("expenses.edit.title")}
          subtitle={expense?.title}
          onBack={navigateBack}
          testID="edit-expense-header"
        />
        {page.loadError ? (
          <FeedbackBanner
            tone="error"
            message={page.loadError}
            onRetry={() => void page.reload()}
            isRetrying={page.participantsLoading || page.groupLoading}
            testID="expense-edit-error"
          />
        ) : null}

        {page.expenseLoading && !expense ? (
          <ExpenseFormSkeleton />
        ) : !expense ? (
          <ExpenseMissingState />
        ) : !page.canManage ? (
          <EmptyState
            title={t("expenses.edit.notAllowedTitle")}
            description={t("expenses.edit.notAllowedText")}
            action={
              <StyledButton
                label={t("expenses.edit.back")}
                onPress={() =>
                  router.replace({
                    pathname: "/expense/[expenseId]",
                    params: { expenseId: expense.id },
                  })
                }
                variant="secondary"
              />
            }
          />
        ) : !page.participantsLoaded ? (
          <ExpenseFormSkeleton />
        ) : page.loadError ? null : page.participants.length === 0 ? (
          <EmptyState
            title={t("expenses.noParticipants.title")}
            description={t("expenses.noParticipants.edit")}
          />
        ) : (
          <ExpenseForm
            key={expense.id}
            ref={formRef}
            groupId={expense.groupId}
            currentUserId={page.currentUserId}
            participants={page.participants}
            initialExpense={expense}
            isLoading={isSaving}
            error={page.expenseError}
            onSubmit={page.save}
          />
        )}
      </Stack>
    </Screen>
  );
}
