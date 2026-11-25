import { useCallback, useEffect, useRef } from "react";
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
import {
  ExpenseForm,
  type ExpenseFormHandle,
} from "../../../../src/features/expenses/components/ExpenseForm";
import { ExpenseFormSkeleton } from "../../../../src/features/expenses/components/ExpenseFormSkeleton";
import { canManageExpense } from "../../../../src/features/expenses/expensePermissions";
import { useExpenseParticipants } from "../../../../src/features/expenses/useExpenseParticipants";
import type { ValidExpenseForm } from "../../../../src/services/expenses/expenseValidation";
import { useAuthStore } from "../../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../../src/state/useGroupStore";

export default function EditExpenseScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const formRef = useRef<ExpenseFormHandle>(null);
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const selectedExpense = useExpenseStore((state) => state.selectedExpense);
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const fetchExpenseDetail = useExpenseStore(
    (state) => state.fetchExpenseDetail,
  );
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const clearExpenseError = useExpenseStore((state) => state.clearError);
  const groups = useGroupStore((state) => state.groups);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const clearGroupError = useGroupStore((state) => state.clearError);
  const expense = selectedExpense?.id === expenseId ? selectedExpense : null;
  // The expense tells which participants to load, so this page loads them.
  const {
    participants,
    isLoading: participantsLoading,
    isLoaded: participantsLoaded,
    error: participantsError,
    runLoad,
    fetchParticipants,
  } = useExpenseParticipants(expense?.groupId ?? null, { autoLoad: false });
  const canManage = canManageExpense(user, expense, groups);
  const navigateBack = () =>
    goBackOr(
      expense
        ? {
            pathname: "/expense/[expenseId]",
            params: { expenseId: expense.id },
          }
        : "/expenses",
    );

  const loadExpense = useCallback(async () => {
    if (!expenseId) return;
    clearExpenseError();
    clearGroupError();
    await runLoad(async () => {
      await fetchExpenseDetail(expenseId);
      const loadedExpense = useExpenseStore.getState().selectedExpense;
      if (!loadedExpense) return;
      await fetchParticipants(loadedExpense.groupId);
      // Group roles decide `canManage`.
      if (loadedExpense.groupId && userId) await fetchGroupsAndInvites(userId);
    });
  }, [
    clearExpenseError,
    clearGroupError,
    expenseId,
    fetchExpenseDetail,
    fetchGroupsAndInvites,
    fetchParticipants,
    runLoad,
    userId,
  ]);

  useEffect(() => {
    void loadExpense();
  }, [loadExpense]);

  const handleSave = async (draft: ValidExpenseForm) => {
    if (!expense) return;
    try {
      await updateExpense(expense.id, {
        ...draft,
        groupId: expense.groupId,
      });
      if (useExpenseStore.getState().error) return;
      router.replace({
        pathname: "/expense/[expenseId]",
        params: { expenseId: expense.id },
      });
    } catch {
      // The expense store exposes update failures to the form.
    }
  };

  const loadError = participantsError ?? groupError;
  // Same condition as the form branch below.
  const showForm =
    !!expense &&
    canManage &&
    !loadError &&
    participantsLoaded &&
    participants.length > 0;

  return (
    <Screen
      padding="lg"
      refreshing={participantsLoading}
      onRefresh={() => void loadExpense()}
      footer={
        showForm ? (
          <StyledButton
            label="Save changes"
            onPress={() => formRef.current?.submit()}
            isLoading={expenseLoading || groupLoading}
            testID="save-expense-button"
          />
        ) : undefined
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Edit expense"
          subtitle={expense?.title}
          onBack={navigateBack}
          testID="edit-expense-header"
        />
        {loadError ? (
          <FeedbackBanner
            tone="error"
            message={loadError}
            onRetry={() => void loadExpense()}
            isRetrying={participantsLoading || groupLoading}
            testID="expense-edit-error"
          />
        ) : null}

        {expenseLoading && !expense ? (
          <ExpenseFormSkeleton />
        ) : !expense ? (
          <EmptyState
            title="Expense unavailable"
            description="This expense could not be found or you do not have access to it."
          />
        ) : !canManage ? (
          <EmptyState
            title="Editing not allowed"
            description="Only the payer, creator, or a group admin can edit this expense."
            action={
              <StyledButton
                label="Back to expense"
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
        ) : !participantsLoaded ? (
          <ExpenseFormSkeleton />
        ) : loadError ? null : participants.length === 0 ? (
          <EmptyState
            title="No participants available"
            description="The expense cannot be edited until its participants are available."
          />
        ) : (
          <ExpenseForm
            key={expense.id}
            ref={formRef}
            groupId={expense.groupId}
            currentUserId={user?.id ?? ""}
            participants={participants}
            initialExpense={expense}
            isLoading={expenseLoading || groupLoading}
            error={expenseError}
            onSubmit={handleSave}
          />
        )}
      </Stack>
    </Screen>
  );
}
