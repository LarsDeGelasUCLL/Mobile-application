import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Card,
  EmptyState,
  FeedbackBanner,
  Row,
  Screen,
  Skeleton,
  Stack,
  Text,
} from "../../../../src/components/primitives";
import { StyledButton } from "../../../../src/components/common/StyledButton";
import { ExpenseForm } from "../../../../src/features/expenses/components/ExpenseForm";
import type { ValidExpenseForm } from "../../../../src/services/expenses/expenseValidation";
import { getUserExpenseParticipants } from "../../../../src/services";
import { useAuthStore } from "../../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../../src/state/useGroupStore";
import type { PublicUserProfileDto, User } from "../../../../src/types";
import { colors } from "../../../../src/theme/colors";

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

export default function EditExpenseScreen() {
  const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
  const user = useAuthStore((state) => state.user);
  const selectedExpense = useExpenseStore((state) => state.selectedExpense);
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const fetchExpenseDetail = useExpenseStore(
    (state) => state.fetchExpenseDetail,
  );
  const fetchIndividualExpenses = useExpenseStore(
    (state) => state.fetchIndividualExpenses,
  );
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const clearExpenseError = useExpenseStore((state) => state.clearError);
  const activeGroupMembers = useGroupStore((state) => state.activeGroupMembers);
  const groups = useGroupStore((state) => state.groups);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchMembersForGroup = useGroupStore(
    (state) => state.fetchMembersForGroup,
  );
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const clearGroupError = useGroupStore((state) => state.clearError);
  const [personalParticipants, setPersonalParticipants] = useState<
    PublicUserProfileDto[]
  >([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null,
  );
  const expense = selectedExpense?.id === expenseId ? selectedExpense : null;
  const groupParticipants = useMemo(() => {
    const profiles = activeGroupMembers
      .filter(
        (member) =>
          member.groupId === expense?.groupId && member.status === "ACTIVE",
      )
      .flatMap((member) => (member.userProfile ? [member.userProfile] : []));
    return includeCurrentUser(profiles, user);
  }, [activeGroupMembers, expense?.groupId, user]);
  const personalParticipantOptions = useMemo(
    () => includeCurrentUser(personalParticipants, user),
    [personalParticipants, user],
  );
  const participants = expense?.groupId
    ? groupParticipants
    : personalParticipantOptions;
  const groupMembership = expense?.groupId
    ? groups.find((item) => item.group.id === expense.groupId)
    : undefined;
  const canManage =
    !!user &&
    !!expense &&
    (groupMembership?.groupRole === "ADMIN" ||
      expense.createdByUserId === user.id ||
      expense.paidByUserId === user.id);
  const navigateBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (expense) {
      router.replace({
        pathname: "/expense/[expenseId]",
        params: { expenseId: expense.id },
      });
    } else {
      router.replace("/expenses");
    }
  };

  const loadExpense = useCallback(async () => {
    if (!expenseId) return;
    clearExpenseError();
    clearGroupError();
    setParticipantsError(null);
    setParticipantsLoading(true);
    try {
      await fetchExpenseDetail(expenseId);
      const loadedExpense = useExpenseStore.getState().selectedExpense;
      if (!loadedExpense) return;
      if (loadedExpense.groupId) {
        await fetchMembersForGroup(loadedExpense.groupId);
        if (user?.id) await fetchGroupsAndInvites(user.id);
      } else if (user?.id) {
        await fetchIndividualExpenses(user.id);
        const history = useExpenseStore.getState().individualExpenses;
        const knownParticipants = await getUserExpenseParticipants(
          user.id,
          history,
        );
        setPersonalParticipants(knownParticipants);
      }
    } catch (error) {
      setParticipantsError(getErrorMessage(error));
    } finally {
      setParticipantsLoading(false);
    }
  }, [
    clearExpenseError,
    clearGroupError,
    expenseId,
    fetchExpenseDetail,
    fetchGroupsAndInvites,
    fetchIndividualExpenses,
    fetchMembersForGroup,
    user?.id,
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

  return (
    <Screen
      padding="lg"
      refreshing={participantsLoading}
      onRefresh={() => void loadExpense()}
    >
      <Stack gap="lg">
        <Row justify="space-between" align="center">
          <Text size="xl" weight="bold">
            Edit expense
          </Text>
          <View style={styles.backButton}>
            <StyledButton
              label="Back"
              onPress={navigateBack}
              variant="secondary"
            />
          </View>
        </Row>

        {loadError ? (
          <FeedbackBanner tone="error" testID="expense-edit-error">
            <Text size="sm" color={colors.error}>
              {loadError}
            </Text>
            <StyledButton
              label="Retry"
              onPress={() => void loadExpense()}
              variant="secondary"
              isLoading={participantsLoading || groupLoading}
            />
          </FeedbackBanner>
        ) : null}

        {expenseLoading && !expense ? (
          <Card>
            <Stack gap="sm">
              <Skeleton height={24} width="65%" />
              <Skeleton height={48} />
              <Skeleton height={48} />
            </Stack>
          </Card>
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
        ) : participantsLoading && participants.length === 0 ? (
          <Card>
            <Stack gap="sm">
              <Skeleton height={24} width="65%" />
              <Skeleton height={48} />
              <Skeleton height={48} />
            </Stack>
          </Card>
        ) : loadError ? null : participants.length === 0 ? (
          <EmptyState
            title="No participants available"
            description="The expense cannot be edited until its participants are available."
          />
        ) : (
          <ExpenseForm
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

const styles = {
  backButton: {
    width: 76,
  },
};
