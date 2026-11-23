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
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { ExpenseForm } from "../../../src/features/expenses/components/ExpenseForm";
import type { ValidExpenseForm } from "../../../src/services/expenses/expenseValidation";
import { getUserExpenseParticipants } from "../../../src/services";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import type { PublicUserProfileDto, User } from "../../../src/types";
import { colors } from "../../../src/theme/colors";

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

  return (
    <Screen
      padding="lg"
      refreshing={participantsLoading}
      onRefresh={() => void loadParticipants()}
    >
      <Stack gap="lg">
        <Row justify="space-between" align="center">
          <Stack gap="none" flex={1}>
            <Text size="xl" weight="bold">
              New {groupId ? "group" : "personal"} expense
            </Text>
            <Text size="sm" color={colors.muted}>
              Add the cost and decide how to split it.
            </Text>
          </Stack>
          <View style={styles.backButton}>
            <StyledButton
              label="Back"
              onPress={() => {
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
              variant="secondary"
            />
          </View>
        </Row>

        {createdExpenseId ? (
          <FeedbackBanner tone="warning" testID="expense-partial-success">
            <Text size="sm" color={colors.warning}>
              {expenseError ?? partialMutationError}
            </Text>
            <StyledButton
              label="Retry balance refresh"
              onPress={() => void retryBalances()}
              variant="secondary"
              isLoading={expenseLoading}
            />
          </FeedbackBanner>
        ) : loadError ? (
          <FeedbackBanner tone="error" testID="expense-participants-error">
            <Text size="sm" color={colors.error}>
              {loadError}
            </Text>
            <StyledButton
              label="Retry participants"
              onPress={() => void loadParticipants()}
              variant="secondary"
              isLoading={participantsLoading || groupLoading}
            />
          </FeedbackBanner>
        ) : participantsLoading && participants.length === 0 ? (
          <Card>
            <Stack gap="sm">
              <Skeleton height={24} width="65%" />
              <Skeleton height={48} />
              <Skeleton height={48} />
            </Stack>
          </Card>
        ) : participants.length === 0 ? (
          <EmptyState
            title="No participants available"
            description="Join a group or add a known participant before recording an expense."
          />
        ) : (
          <ExpenseForm
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

const styles = {
  backButton: {
    width: 76,
  },
};
