import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  Card,
  CardList,
  EmptyState,
  FeedbackBanner,
  ListRow,
  Row,
  Screen,
  SectionHeader,
  Skeleton,
  SkeletonCard,
  Stack,
  StyledButton,
  Text,
} from "../../../src/components/primitives";
import { ExpenseRow } from "../../../src/features/expenses/components/ExpenseRow";
import { GroupHighlights } from "../../../src/features/home/components/GroupHighlights";
import { HomeHeader } from "../../../src/features/home/components/HomeHeader";
import { makeStyles } from "../../../src/theme/ThemeProvider";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import type { GroupHighlight } from "../../../src/types";
import { describeBalance, summarizeBalances } from "../../../src/utils/money";

export default function HomeScreen() {
  const router = useRouter();
  const styles = useStyles();
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
  }));
  // Personal expenses only: Home loads no group expenses (see AI_OVERVIEW §7).
  const { youAreOwed, youOwe } = summarizeBalances(expenses, user?.id ?? "");
  const owed = describeBalance(youAreOwed);
  const owe = describeBalance(-youOwe);

  return (
    <Screen
      padding="md"
      refreshing={groupLoading || expenseLoading}
      onRefresh={loadHome}
      testID="home-screen"
    >
      <Stack gap="lg">
        <HomeHeader name={user?.displayName ?? "User"} />

        {expenseError && expenses.length === 0 ? null : (
          <Card>
            <View style={styles.summary} testID="home-balance-summary">
              <Text size="sm" tone="muted">
                Personal expenses
              </Text>
              {expenseLoading && expenses.length === 0 ? (
                <Skeleton height={28} width="70%" />
              ) : (
                <Row gap="md">
                  {[
                    { label: "You get back", balance: owed },
                    { label: "You owe", balance: owe },
                  ].map(({ label, balance }) => (
                    <View
                      key={label}
                      style={styles.balance}
                      accessible
                      accessibilityLabel={`${label} ${balance.amount}`}
                    >
                      <Text size="sm" tone="muted">
                        {label}
                      </Text>
                      <Text size="xl" weight="bold" tone={balance.tone}>
                        {balance.amount}
                      </Text>
                    </View>
                  ))}
                </Row>
              )}
            </View>
          </Card>
        )}

        {pendingInvites.length > 0 ? (
          <Card flush>
            <ListRow
              icon="mail-outline"
              label={`${pendingInvites.length} ${pendingInvites.length === 1 ? "invitation" : "invitations"}`}
              description="Waiting for your answer"
              onPress={() => router.push("/groups")}
              testID="home-invitations-row"
            />
          </Card>
        ) : null}

        <Stack gap="sm">
          <SectionHeader
            title="Groups"
            variant="title"
            onAction={() => router.push("/groups")}
            actionTestID="home-groups-see-all"
          />
          {groupError ? (
            <FeedbackBanner
              tone="error"
              message={groupError}
              onRetry={loadGroups}
              retryLabel="Retry groups"
              isRetrying={groupLoading}
              retryTestID="home-groups-retry-button"
              testID="home-groups-error"
            />
          ) : null}
          {groupError && groups.length === 0 ? null : groupLoading &&
            groups.length === 0 ? (
            <SkeletonCard
              lines={[
                { height: 22, width: "60%" },
                { height: 16, width: "85%" },
              ]}
            />
          ) : groups.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No groups yet"
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
          <SectionHeader
            title="Recent expenses"
            variant="title"
            onAction={
              expenses.length > 3 ? () => router.push("/expenses") : undefined
            }
            actionTestID="home-expenses-see-all"
          />
          {expenseError ? (
            <FeedbackBanner
              tone="error"
              message={expenseError}
              onRetry={loadExpenses}
              retryLabel="Retry expenses"
              isRetrying={expenseLoading}
              retryTestID="home-expenses-retry-button"
              testID="home-expenses-error"
            />
          ) : null}
          {expenseError && expenses.length === 0 ? null : expenseLoading &&
            expenses.length === 0 ? (
            <SkeletonCard
              lines={[
                { height: 22, width: "60%" },
                { height: 16, width: "85%" },
              ]}
            />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
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
            <CardList>
              {expenses.slice(0, 3).map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </CardList>
          )}
        </Stack>
      </Stack>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  summary: { gap: t.spacing.sm },
  balance: { flex: 1, gap: t.spacing.xs },
}));
