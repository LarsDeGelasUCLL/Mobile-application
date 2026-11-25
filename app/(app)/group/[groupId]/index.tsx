import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../../src/features/navigation/goBackOr";
import {
  BalanceRow,
  Card,
  CardList,
  EmptyState,
  FeedbackBanner,
  IconButton,
  ListRow,
  MaskedValue,
  Screen,
  ScreenHeader,
  SectionHeader,
  Sheet,
  SkeletonCard,
  Stack,
  StyledButton,
  Text,
} from "../../../../src/components/primitives";
import { ExpenseRow } from "../../../../src/features/expenses/components/ExpenseRow";
import { useGroupDetail } from "../../../../src/features/groups/useGroupDetail";

const RECENT_EXPENSES = 5;

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const {
    user,
    group,
    groupExpenses,
    visibleBalances,
    balancesLoaded,
    isLoading,
    storeError,
    expensesLoading,
    expensesError,
    reload,
    retryExpenses,
  } = useGroupDetail(groupId);
  const [codeOpen, setCodeOpen] = useState(false);

  const addExpense = () =>
    router.push({ pathname: "/expense/create", params: { groupId } });

  return (
    <Screen
      padding="lg"
      refreshing={isLoading || expensesLoading}
      onRefresh={() => void reload()}
      footer={
        group ? (
          <StyledButton
            label="Add expense"
            onPress={addExpense}
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
                  onPress={() => setCodeOpen(true)}
                  testID="group-invite-code-button"
                />
                <IconButton
                  icon="settings-outline"
                  accessibilityLabel="Group settings"
                  onPress={() =>
                    router.push({
                      pathname: "/group/[groupId]/settings",
                      params: { groupId },
                    })
                  }
                  testID="group-settings-button"
                />
              </>
            ) : undefined
          }
          testID="group-detail-header"
        />

        {storeError ? (
          <FeedbackBanner
            tone="error"
            message={storeError}
            onRetry={() => void reload()}
            isRetrying={isLoading}
            retryTestID="group-detail-retry-button"
            testID="group-detail-error"
          />
        ) : null}

        {expensesError ? (
          <FeedbackBanner
            tone="error"
            message={expensesError}
            onRetry={retryExpenses}
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
          <EmptyState
            icon="people-outline"
            title="Group unavailable"
            description="This group could not be found in your active groups."
            action={
              <StyledButton
                label="Back to groups"
                onPress={() => router.replace("/groups")}
                variant="secondary"
              />
            }
          />
        ) : (
          <>
            <Stack gap="sm">
              <SectionHeader title="BALANCES" />
              {expensesError &&
              visibleBalances.length === 0 ? null : expensesLoading &&
                visibleBalances.length === 0 ? (
                <SkeletonCard
                  lines={[
                    { height: 20, width: "60%" },
                    { height: 18, width: "45%" },
                  ]}
                />
              ) : !balancesLoaded && !expensesError ? (
                <Card>
                  <Text size="sm" tone="muted">
                    Balances are loading.
                  </Text>
                </Card>
              ) : visibleBalances.length === 0 ? (
                <EmptyState
                  icon="wallet-outline"
                  title="No balances yet"
                  description="Balances appear after your group records its first expense."
                />
              ) : (
                <CardList variant="padded">
                  {visibleBalances.map((balance) => (
                    <BalanceRow
                      key={balance.userId}
                      name={
                        balance.userId === user?.id
                          ? "You"
                          : balance.displayName
                      }
                      amount={balance.netBalance}
                      testID={`group-balance-${balance.userId}`}
                    />
                  ))}
                </CardList>
              )}
            </Stack>

            <Stack gap="sm">
              <SectionHeader title="RECENT EXPENSES" />
              {expensesError &&
              groupExpenses.length === 0 ? null : expensesLoading &&
                groupExpenses.length === 0 ? (
                <SkeletonCard
                  lines={[
                    { height: 22, width: "55%" },
                    { height: 16, width: "80%" },
                  ]}
                />
              ) : groupExpenses.length === 0 ? (
                <EmptyState
                  icon="receipt-outline"
                  title="No group expenses"
                  description="Add an expense to start tracking shared costs."
                />
              ) : (
                <CardList>
                  {/* Store keeps them newest first. */}
                  {groupExpenses.slice(0, RECENT_EXPENSES).map((expense) => (
                    <ExpenseRow key={expense.id} expense={expense} />
                  ))}
                  {groupExpenses.length > RECENT_EXPENSES ? (
                    <ListRow
                      label={`See all ${groupExpenses.length} expenses`}
                      onPress={() =>
                        router.push({
                          pathname: "/group/[groupId]/expenses",
                          params: { groupId },
                        })
                      }
                      testID="group-see-all-expenses"
                    />
                  ) : null}
                </CardList>
              )}
            </Stack>
          </>
        )}
      </Stack>

      {group ? (
        <Sheet
          visible={codeOpen}
          onClose={() => setCodeOpen(false)}
          title="Invite code"
          testID="group-invite-code-sheet"
        >
          <Text size="sm" tone="muted">
            Share this code with people you want to add. An admin approves each
            request.
          </Text>
          <MaskedValue
            label="Code"
            value={group.inviteCode}
            shareMessage={`Join "${group.name}" on Laruna with invite code ${group.inviteCode}`}
            testID="group-invite-code"
          />
        </Sheet>
      ) : null}
    </Screen>
  );
}
