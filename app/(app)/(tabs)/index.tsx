import {
  Card,
  ListRow,
  Screen,
  Stack,
} from "../../../src/components/primitives";
import { BalanceSummaryCard } from "../../../src/features/home/components/BalanceSummaryCard";
import { HomeGroupsSection } from "../../../src/features/home/components/HomeGroupsSection";
import { HomeHeader } from "../../../src/features/home/components/HomeHeader";
import { HomeRecentExpenses } from "../../../src/features/home/components/HomeRecentExpenses";
import { useHomePage } from "../../../src/features/home/useHomePage";

export default function HomeScreen() {
  const page = useHomePage();

  return (
    <Screen
      padding="md"
      refreshing={page.groupLoading || page.expenseLoading}
      onRefresh={page.loadHome}
      testID="home-screen"
    >
      <Stack gap="lg">
        <HomeHeader name={page.userName} />

        {page.expenseError && page.expenses.length === 0 ? null : (
          <BalanceSummaryCard
            youAreOwed={page.balances.youAreOwed}
            youOwe={page.balances.youOwe}
            isLoading={page.expenseLoading && page.expenses.length === 0}
            testID="home-balance-summary"
          />
        )}

        {page.pendingInviteCount > 0 ? (
          <Card flush>
            <ListRow
              icon="mail-outline"
              label={page.invitationLabel}
              description="Waiting for your answer"
              onPress={page.openGroups}
              testID="home-invitations-row"
            />
          </Card>
        ) : null}

        <HomeGroupsSection
          groups={page.groupHighlights}
          isLoading={page.groupLoading}
          error={page.groupError}
          onRetry={page.loadGroups}
          onBrowse={page.openGroups}
          onOpenGroup={page.openGroup}
        />
        <HomeRecentExpenses
          expenses={page.expenses}
          isLoading={page.expenseLoading}
          error={page.expenseError}
          onRetry={page.loadExpenses}
          onSeeAll={page.openExpenses}
          onAddExpense={page.createExpense}
          onOpenExpense={page.openExpense}
        />
      </Stack>
    </Screen>
  );
}
