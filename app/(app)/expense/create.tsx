import { useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import {
  EmptyState,
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import {
  ExpenseForm,
  type ExpenseFormHandle,
} from "../../../src/features/expenses/components/ExpenseForm";
import { ExpenseFormSkeleton } from "../../../src/features/expenses/components/ExpenseFormSkeleton";
import { useExpenseParticipants } from "../../../src/features/expenses/useExpenseParticipants";
import type { ValidExpenseForm } from "../../../src/services/expenses/expenseValidation";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";

export default function CreateExpenseScreen() {
  const { groupId: routeGroupId } = useLocalSearchParams<{
    groupId?: string;
  }>();
  const groupId = typeof routeGroupId === "string" ? routeGroupId : null;
  const formRef = useRef<ExpenseFormHandle>(null);
  const user = useAuthStore((state) => state.user);
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const fetchGroupExpensesAndBalances = useExpenseStore(
    (state) => state.fetchGroupExpensesAndBalances,
  );
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const {
    participants,
    isLoading: participantsLoading,
    isLoaded: participantsLoaded,
    error: participantsError,
    reload: reloadParticipants,
  } = useExpenseParticipants(groupId);
  const [createdExpenseId, setCreatedExpenseId] = useState<string | null>(null);
  const [partialMutationError, setPartialMutationError] = useState<
    string | null
  >(null);

  const handleCreate = async (draft: ValidExpenseForm) => {
    try {
      const created = await addExpense({ ...draft, groupId });
      const mutationError = useExpenseStore.getState().error;
      if (mutationError) {
        setCreatedExpenseId(created.id);
        setPartialMutationError(mutationError);
        return;
      }
      router.replace({
        pathname: "/expense/[expenseId]",
        params: { expenseId: created.id },
      });
    } catch {
      // The expense store exposes create failures to the form.
    }
  };

  const retryBalances = async () => {
    if (!groupId || !createdExpenseId) return;
    try {
      await fetchGroupExpensesAndBalances(groupId);
      if (!useExpenseStore.getState().error) {
        router.replace({
          pathname: "/expense/[expenseId]",
          params: { expenseId: createdExpenseId },
        });
      }
    } catch {
      // The expense store keeps the retryable balance error.
    }
  };

  const loadError = participantsError ?? (groupId ? groupError : null);
  // Same condition as the form branch below.
  const showForm =
    !createdExpenseId &&
    !loadError &&
    participantsLoaded &&
    participants.length > 0;

  return (
    <Screen
      padding="lg"
      refreshing={participantsLoading}
      onRefresh={() => void reloadParticipants()}
      footer={
        showForm ? (
          <StyledButton
            label="Create expense"
            onPress={() => formRef.current?.submit()}
            isLoading={expenseLoading || groupLoading}
            testID="save-expense-button"
          />
        ) : undefined
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title={`New ${groupId ? "group" : "personal"} expense`}
          subtitle="Add the cost and decide how to split it."
          onBack={() =>
            goBackOr(
              groupId
                ? { pathname: "/group/[groupId]", params: { groupId } }
                : "/expenses",
            )
          }
          testID="create-expense-header"
        />

        {createdExpenseId ? (
          <FeedbackBanner
            tone="warning"
            message={expenseError ?? partialMutationError ?? ""}
            onRetry={() => void retryBalances()}
            retryLabel="Retry balance refresh"
            isRetrying={expenseLoading}
            testID="expense-partial-success"
          />
        ) : loadError ? (
          <FeedbackBanner
            tone="error"
            message={loadError}
            onRetry={() => void reloadParticipants()}
            retryLabel="Retry participants"
            isRetrying={participantsLoading || groupLoading}
            testID="expense-participants-error"
          />
        ) : !participantsLoaded ? (
          <ExpenseFormSkeleton />
        ) : participants.length === 0 ? (
          <EmptyState
            title="No participants available"
            description="Join a group or add a known participant before recording an expense."
          />
        ) : (
          <ExpenseForm
            ref={formRef}
            groupId={groupId}
            currentUserId={user?.id ?? ""}
            participants={participants}
            isLoading={expenseLoading || groupLoading}
            error={expenseError}
            onSubmit={handleCreate}
          />
        )}
      </Stack>
    </Screen>
  );
}
