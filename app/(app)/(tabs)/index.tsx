import { Fragment, useCallback, useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import {
  Card,
  Divider,
  EmptyState,
  FeedbackBanner,
  ListRow,
  Row,
  Screen,
  Skeleton,
  Stack,
  StyledButton,
  Text,
} from "../../../src/components/primitives";
import { ExpenseRow } from "../../../src/features/expenses/components/ExpenseRow";
import { GroupHighlights } from "../../../src/features/home/components/GroupHighlights";
import { HomeHeader } from "../../../src/features/home/components/HomeHeader";
import { makeStyles, useTheme } from "../../../src/theme/ThemeProvider";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import type { GroupHighlight } from "../../../src/types";
import { describeBalance, summarizeBalances } from "../../../src/utils/money";

export default function HomeScreen() {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
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
  // Personal expenses only: Home loads no group expenses (see AI_OVERVIEW §7).
  const { youAreOwed, youOwe } = summarizeBalances(expenses, user?.id ?? "");
  const owed = describeBalance(youAreOwed);
  const owe = describeBalance(-youOwe);

  const sectionHeader = (title: string, onSeeAll?: () => void) => (
    <Row justify="space-between" align="center">
      <Text size="lg" weight="bold">
        {title}
      </Text>
      {onSeeAll ? (
        <StyledButton label="See all" onPress={onSeeAll} variant="link" />
      ) : null}
    </Row>
  );

  return (
    <Screen
      padding="md"
      refreshing={groupLoading || expenseLoading}
      onRefresh={loadHome}
    >
      <View style={styles.container} testID="home-screen">
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
                        <Text
                          size="xl"
                          weight="bold"
                          tone={balance.tone}
                        >
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
            {sectionHeader("Groups", () => router.push("/groups"))}
            {groupError ? (
              <FeedbackBanner tone="error" testID="home-groups-error">
                <Text size="sm" tone="error">
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
            {sectionHeader(
              "Recent expenses",
              expenses.length > 3 ? () => router.push("/expenses") : undefined,
            )}
            {expenseError ? (
              <FeedbackBanner tone="error" testID="home-expenses-error">
                <Text size="sm" tone="error">
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
              <Card flush>
                {expenses.slice(0, 3).map((expense, index) => (
                  <Fragment key={expense.id}>
                    {index > 0 ? <Divider /> : null}
                    <ExpenseRow expense={expense} />
                  </Fragment>
                ))}
              </Card>
            )}
          </Stack>
        </Stack>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  container: { flex: 1 },
  summary: { gap: t.spacing.sm },
  balance: { flex: 1, gap: t.spacing.xs },
}));
