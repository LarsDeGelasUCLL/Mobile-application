import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  EmptyState,
  FeedbackBanner,
  Screen,
  ScreenHeader,
  SkeletonCard,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import {
  ExpenseForm,
  type ExpenseFormHandle,
} from "../../../src/features/expenses/components/ExpenseForm";
import type { ValidExpenseForm } from "../../../src/services/expenses/expenseValidation";
import { getUserExpenseParticipants } from "../../../src/services";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import type { PublicUserProfileDto, User } from "../../../src/types";

function currentUserProfile(user: User | null): PublicUserProfileDto | null {
  if (!user) return null;
  return {
    id: user.id,
    displayName: user.displayName,
    profilePictureUrl: user.profilePictureUrl,
    customBio: user.customBio,
    recordCreated: user.recordCreated,
  };
}

function includeCurrentUser(
  participants: PublicUserProfileDto[],
  user: User | null,
): PublicUserProfileDto[] {
  const merged = new Map(participants.map((profile) => [profile.id, profile]));
  const currentUser = currentUserProfile(user);
  if (currentUser && !merged.has(currentUser.id)) {
    merged.set(currentUser.id, currentUser);
  }
  return Array.from(merged.values());
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Could not load participants.";
}

export default function CreateExpenseScreen() {
  const { groupId: routeGroupId } = useLocalSearchParams<{
    groupId?: string;
  }>();
  const groupId = typeof routeGroupId === "string" ? routeGroupId : null;
  const formRef = useRef<ExpenseFormHandle>(null);
  const user = useAuthStore((state) => state.user);
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const fetchIndividualExpenses = useExpenseStore(
    (state) => state.fetchIndividualExpenses,
  );
  const addExpense = useExpenseStore((state) => state.addExpense);
  const fetchGroupExpensesAndBalances = useExpenseStore(
    (state) => state.fetchGroupExpensesAndBalances,
  );
  const clearExpenseError = useExpenseStore((state) => state.clearError);
  const activeGroupMembers = useGroupStore((state) => state.activeGroupMembers);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchMembersForGroup = useGroupStore(
    (state) => state.fetchMembersForGroup,
  );
  const clearGroupError = useGroupStore((state) => state.clearError);
  const [personalParticipants, setPersonalParticipants] = useState<
    PublicUserProfileDto[]
  >([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  // `participants` always holds the current user, so length cannot signal the first load.
  const [participantsLoaded, setParticipantsLoaded] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null,
  );
  const [createdExpenseId, setCreatedExpenseId] = useState<string | null>(null);
  const [partialMutationError, setPartialMutationError] = useState<
    string | null
  >(null);

  const groupParticipants = useMemo(() => {
    const profiles = activeGroupMembers
      .filter(
        (member) => member.groupId === groupId && member.status === "ACTIVE",
      )
      .flatMap((member) => (member.userProfile ? [member.userProfile] : []));
    return includeCurrentUser(profiles, user);
  }, [activeGroupMembers, groupId, user]);
  const personalParticipantOptions = useMemo(
    () => includeCurrentUser(personalParticipants, user),
    [personalParticipants, user],
  );
  const participants = groupId ? groupParticipants : personalParticipantOptions;

  const loadParticipants = useCallback(async () => {
    if (!user?.id) return;
    setParticipantsLoading(true);
    setParticipantsError(null);
    if (groupId) {
      clearGroupError();
      try {
        await fetchMembersForGroup(groupId);
      } catch (error) {
        setParticipantsError(getErrorMessage(error));
      } finally {
        setParticipantsLoading(false);
        setParticipantsLoaded(true);
      }
      return;
    }

    clearExpenseError();
    try {
      await fetchIndividualExpenses(user.id);
      const history = useExpenseStore.getState().individualExpenses;
      const knownParticipants = await getUserExpenseParticipants(
        user.id,
        history,
      );
      setPersonalParticipants(knownParticipants);
    } catch (error) {
      setParticipantsError(getErrorMessage(error));
    } finally {
      setParticipantsLoading(false);
      setParticipantsLoaded(true);
    }
  }, [
    clearExpenseError,
    clearGroupError,
    fetchIndividualExpenses,
    fetchMembersForGroup,
    groupId,
    user?.id,
  ]);

  useEffect(() => {
    void loadParticipants();
  }, [loadParticipants]);

  const handleCreate = async (draft: ValidExpenseForm) => {
    try {
      const created = await addExpense({
        ...draft,
        groupId,
      });
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
      onRefresh={() => void loadParticipants()}
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
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else if (groupId) {
              router.replace({
                pathname: "/group/[groupId]",
                params: { groupId },
              });
            } else {
              router.replace("/expenses");
            }
          }}
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
            onRetry={() => void loadParticipants()}
            retryLabel="Retry participants"
            isRetrying={participantsLoading || groupLoading}
            testID="expense-participants-error"
          />
        ) : !participantsLoaded ? (
          <SkeletonCard
            lines={[
              { height: 24, width: "65%" },
              { height: 48 },
              { height: 48 },
            ]}
          />
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
