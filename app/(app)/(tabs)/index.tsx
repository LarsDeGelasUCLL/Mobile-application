import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Badge,
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
import { GroupHighlights } from "../../../src/features/home/components/GroupHighlights";
import { HomeHeader } from "../../../src/features/home/components/HomeHeader";
import { colors } from "../../../src/theme/colors";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import type { GroupHighlight } from "../../../src/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);
  const pendingInvites = useGroupStore((state) => state.pendingInvites);
  const groupLoading = useGroupStore((state) => state.isLoading);
  const groupError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const clearGroupError = useGroupStore((state) => state.clearError);
  const expenses = useExpenseStore((state) => state.individualExpenses);
  const expenseLoading = useExpenseStore((state) => state.isLoading);
  const expenseError = useExpenseStore((state) => state.error);
  const fetchIndividualExpenses = useExpenseStore(
    (state) => state.fetchIndividualExpenses,
  );
  const clearExpenseError = useExpenseStore((state) => state.clearError);

  const loadGroups = useCallback(() => {
    if (!user?.id) return;
    clearGroupError();
    void fetchGroupsAndInvites(user.id).catch(() => undefined);
  }, [clearGroupError, fetchGroupsAndInvites, user?.id]);

  const loadExpenses = useCallback(() => {
    if (!user?.id) return;
    clearExpenseError();
    void fetchIndividualExpenses(user.id).catch(() => undefined);
  }, [clearExpenseError, fetchIndividualExpenses, user?.id]);

  const loadHome = useCallback(() => {
    loadGroups();
    loadExpenses();
  }, [loadExpenses, loadGroups]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const groupHighlights: GroupHighlight[] = groups.map(({ group }) => ({
    id: group.id,
    name: group.name,
    imageUri: group.groupIconUrl ?? undefined,
    fallbackColor: colors.primary,
  }));

  return (
    <Screen
      padding="md"
      refreshing={groupLoading || expenseLoading}
      onRefresh={loadHome}
    >
      <View style={styles.container} testID="home-screen">
        <Stack gap="lg">
          <HomeHeader name={user?.displayName ?? "User"} />

          {groupError ? (
            <FeedbackBanner tone="error" testID="home-groups-error">
              <Text size="sm" color={colors.error}>
                {groupError}
              </Text>
              <StyledButton
                label="Retry groups"
                onPress={loadGroups}
                variant="secondary"
                isLoading={groupLoading}
                testID="home-groups-retry-button"
              />
            </FeedbackBanner>
          ) : null}

          {expenseError ? (
            <FeedbackBanner tone="error" testID="home-expenses-error">
              <Text size="sm" color={colors.error}>
                {expenseError}
              </Text>
              <StyledButton
                label="Retry expenses"
                onPress={loadExpenses}
                variant="secondary"
                isLoading={expenseLoading}
                testID="home-expenses-retry-button"
              />
            </FeedbackBanner>
          ) : null}

          {pendingInvites.length > 0 ? (
            <Card>
              <Row justify="space-between" align="center" gap="sm">
                <Stack gap="none" flex={1}>
                  <Text size="sm" weight="medium">
                    {pendingInvites.length} pending{" "}
                    {pendingInvites.length === 1
                      ? "group invitation"
                      : "group invitations"}
                  </Text>
                </Stack>
                <StyledButton
                  label="Review"
                  onPress={() => router.push("/groups")}
                  variant="secondary"
                />
              </Row>
            </Card>
          ) : null}

          <Stack gap="sm">
            <Row justify="space-between" align="center">
              <Text size="lg" weight="bold">
                Groups
              </Text>
              <Badge label={String(groups.length)} />
            </Row>
            {groupError && groups.length === 0 ? null : groupLoading &&
              groups.length === 0 ? (
              <Card>
                <Stack gap="sm">
                  <Skeleton height={22} width="60%" />
                  <Skeleton height={16} width="85%" />
                </Stack>
              </Card>
            ) : groups.length === 0 ? (
              <EmptyState
                title="No active groups"
                description="Create a group or join friends to see it here."
                action={
                  <StyledButton
                    label="Browse groups"
                    onPress={() => router.push("/groups")}
                    variant="secondary"
                  />
                }
              />
            ) : (
              <GroupHighlights
                groups={groupHighlights}
                onSeeAllPress={() => router.push("/groups")}
                onGroupPress={(group) =>
                  router.push({
                    pathname: "/group/[groupId]",
                    params: { groupId: group.id },
                  })
                }
              />
            )}
          </Stack>

          <Stack gap="sm">
            <Row justify="space-between" align="center">
              <Text size="lg" weight="bold">
                Recent expenses
              </Text>
              <Badge
                label={`${expenses.length} ${expenses.length === 1 ? "expense" : "expenses"}`}
              />
            </Row>
            {expenseError && expenses.length === 0 ? null : expenseLoading &&
              expenses.length === 0 ? (
              <Card>
                <Stack gap="sm">
                  <Skeleton height={22} width="60%" />
                  <Skeleton height={16} width="85%" />
                </Stack>
              </Card>
            ) : expenses.length === 0 ? (
              <EmptyState
                title="No personal expenses yet"
                description="Your recent personal expenses will appear here."
                action={
                  <StyledButton
                    label="Add expense"
                    onPress={() => router.push("/expense/create")}
                  />
                }
              />
            ) : (
              <Stack gap="sm">
                {expenses.slice(0, 3).map((expense) => (
                  <Card
                    key={expense.id}
                    onPress={() =>
                      router.push({
                        pathname: "/expense/[expenseId]",
                        params: { expenseId: expense.id },
                      })
                    }
                  >
                    <Row justify="space-between" align="center">
                      <Stack gap="none" flex={1}>
                        <Text weight="bold">{expense.title}</Text>
                        <Text size="sm" color={colors.muted}>
                          Paid by{" "}
                          {expense.paidByProfile?.displayName ??
                            "A participant"}
                        </Text>
                      </Stack>
                      <Text weight="bold">
                        {formatCurrency(expense.amount)}
                      </Text>
                    </Row>
                  </Card>
                ))}
                {expenses.length > 3 ? (
                  <StyledButton
                    label="See all expenses"
                    onPress={() => router.push("/expenses")}
                    variant="secondary"
                  />
                ) : null}
              </Stack>
            )}
          </Stack>
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
