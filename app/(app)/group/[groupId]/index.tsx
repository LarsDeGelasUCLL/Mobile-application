import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../../src/features/navigation/goBackOr";
import {
  FeedbackBanner,
  IconButton,
  Screen,
  ScreenHeader,
  SkeletonCard,
  Stack,
  StyledButton,
} from "../../../../src/components/primitives";
import { GroupBalancesSection } from "../../../../src/features/groups/components/GroupBalancesSection";
import { GroupUnavailableState } from "../../../../src/features/groups/components/GroupUnavailableState";
import { InviteCodeSheet } from "../../../../src/features/groups/components/InviteCodeSheet";
import { RecentExpensesSection } from "../../../../src/features/groups/components/RecentExpensesSection";
import { useGroupDetailPage } from "../../../../src/features/groups/useGroupDetailPage";

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const page = useGroupDetailPage(groupId);
  const { group, isLoading, expensesLoading, expensesError } = page;

  return (
    <Screen
      padding="lg"
      refreshing={isLoading || expensesLoading}
      onRefresh={() => void page.reload()}
      footer={
        group ? (
          <StyledButton
            label="Add expense"
            onPress={page.addExpense}
            testID="create-group-expense-button"
          />
        ) : undefined
      }
      testID="group-detail-screen"
    >
      <Stack gap="lg">
        <ScreenHeader
          title={group?.name ?? "Group"}
          onBack={() => goBackOr("/groups")}
          actions={
            group ? (
              <>
                <IconButton
                  icon="key-outline"
                  accessibilityLabel="Show invite code"
                  onPress={page.openCode}
                  testID="group-invite-code-button"
                />
                <IconButton
                  icon="settings-outline"
                  accessibilityLabel="Group settings"
                  onPress={page.openSettings}
                  testID="group-settings-button"
                />
              </>
            ) : undefined
          }
          testID="group-detail-header"
        />
        {page.storeError ? (
          <FeedbackBanner
            tone="error"
            message={page.storeError}
            onRetry={() => void page.reload()}
            isRetrying={isLoading}
            retryTestID="group-detail-retry-button"
            testID="group-detail-error"
          />
        ) : null}
        {expensesError ? (
          <FeedbackBanner
            tone="error"
            message={expensesError}
            onRetry={page.retryExpenses}
            retryLabel="Retry expenses"
            isRetrying={expensesLoading}
            retryTestID="group-expenses-retry-button"
            testID="group-expenses-error"
          />
        ) : null}

        {!group && isLoading ? (
          <SkeletonCard
            lines={[
              { height: 24, width: "60%" },
              { height: 16, width: "85%" },
            ]}
          />
        ) : !group ? (
          <GroupUnavailableState onBack={() => router.replace("/groups")} />
        ) : (
          <>
            <GroupBalancesSection
              balances={page.visibleBalances}
              currentUserId={page.user?.id}
              loaded={page.balancesLoaded}
              isLoading={expensesLoading}
              hasError={!!expensesError}
            />
            <RecentExpensesSection
              expenses={page.groupExpenses}
              isLoading={expensesLoading}
              hasError={!!expensesError}
              onSeeAll={page.openAllExpenses}
              onOpenExpense={page.openExpense}
              testID="group-recent-expenses"
            />
          </>
        )}
      </Stack>

      {group ? (
        <InviteCodeSheet
          group={group}
          visible={page.codeOpen}
          onClose={page.closeCode}
          testID="group-invite-code-sheet"
        />
      ) : null}
    </Screen>
  );
}
