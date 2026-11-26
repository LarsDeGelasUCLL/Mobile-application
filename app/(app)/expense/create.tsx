import { useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  EmptyState,
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import { useI18n } from "../../../src/i18n";
import {
  ExpenseForm,
  type ExpenseFormHandle,
} from "../../../src/features/expenses/components/ExpenseForm";
import { ExpenseFormSkeleton } from "../../../src/features/expenses/components/ExpenseFormSkeleton";
import { useCreateExpense } from "../../../src/features/expenses/useCreateExpense";

export default function CreateExpenseScreen() {
  const { t } = useI18n();
  const { groupId: routeGroupId } = useLocalSearchParams<{
    groupId?: string;
  }>();
  const groupId = typeof routeGroupId === "string" ? routeGroupId : null;
  const formRef = useRef<ExpenseFormHandle>(null);
  const page = useCreateExpense(groupId);
  const isSaving = page.expenseLoading || page.groupLoading;

  return (
    <Screen
      padding="lg"
      refreshing={page.participantsLoading}
      onRefresh={() => void page.reloadParticipants()}
      footer={
        page.showForm ? (
          <StyledButton
            label={t("expenses.create.submit")}
            onPress={() => formRef.current?.submit()}
            isLoading={isSaving}
            testID="save-expense-button"
          />
        ) : undefined
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title={t(
            groupId
              ? "expenses.create.titleGroup"
              : "expenses.create.titlePersonal",
          )}
          subtitle={t("expenses.create.subtitle")}
          onBack={() =>
            goBackOr(
              groupId
                ? { pathname: "/group/[groupId]", params: { groupId } }
                : "/expenses",
            )
          }
          testID="create-expense-header"
        />

        {page.isPartialSuccess ? (
          <FeedbackBanner
            tone="warning"
            message={page.partialSuccessMessage}
            onRetry={() => void page.retryBalances()}
            retryLabel={t("expenses.create.retryBalances")}
            isRetrying={page.expenseLoading}
            testID="expense-partial-success"
          />
        ) : page.loadError ? (
          <FeedbackBanner
            tone="error"
            message={page.loadError}
            onRetry={() => void page.reloadParticipants()}
            retryLabel={t("expenses.retryParticipants")}
            isRetrying={page.participantsLoading || page.groupLoading}
            testID="expense-participants-error"
          />
        ) : !page.participantsLoaded ? (
          <ExpenseFormSkeleton />
        ) : page.participants.length === 0 ? (
          <EmptyState
            title={t("expenses.noParticipants.title")}
            description={t("expenses.noParticipants.create")}
          />
        ) : (
          <ExpenseForm
            // A new key resets the form when the signed-in user changes.
            key={page.currentUserId}
            ref={formRef}
            groupId={groupId}
            currentUserId={page.currentUserId}
            participants={page.participants}
            isLoading={isSaving}
            error={page.expenseError}
            onSubmit={page.create}
          />
        )}
      </Stack>
    </Screen>
  );
}
