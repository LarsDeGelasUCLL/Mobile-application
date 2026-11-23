import { Fragment, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  BalanceRow,
  Card,
  Divider,
  EmptyState,
  FeedbackBanner,
  IconButton,
  ListRow,
  MaskedValue,
  Screen,
  ScreenHeader,
  Sheet,
  Skeleton,
  Stack,
  Text,
} from "../../../../src/components/primitives";
import { StyledButton } from "../../../../src/components/common/StyledButton";
import { GroupExpenseRow } from "../../../../src/features/groups/components/GroupExpenseRow";
import { useGroupDetail } from "../../../../src/features/groups/useGroupDetail";
import { useTheme } from "../../../../src/theme/ThemeProvider";

const RECENT_EXPENSES = 5;

export default function GroupDetailScreen() {
  const { colors } = useTheme();
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
    >
      <View testID="group-detail-screen">
        <Stack gap="lg">
          <ScreenHeader
            title={group?.name ?? "Group"}
            onBack={() =>
              router.canGoBack() ? router.back() : router.replace("/groups")
            }
            actions={
              group ? (
                <>
                  <IconButton
                    icon="key-outline"
                    accessibilityLabel="Show invite code"
                    onPress={() => setCodeOpen(true)}
                    color={colors.text}
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
                    color={colors.text}
                    testID="group-settings-button"
                  />
                </>
              ) : undefined
            }
            testID="group-detail-header"
          />

          {storeError ? (
            <FeedbackBanner tone="error" testID="group-detail-error">
              <Text size="sm" color={colors.error}>
                {storeError}
              </Text>
              <StyledButton
                label="Retry"
                onPress={() => void reload()}
                variant="secondary"
                isLoading={isLoading}
                testID="group-detail-retry-button"
              />
            </FeedbackBanner>
          ) : null}

          {expensesError ? (
            <FeedbackBanner tone="error" testID="group-expenses-error">
              <Text size="sm" color={colors.error}>
                {expensesError}
              </Text>
              <StyledButton
                label="Retry expenses"
                onPress={retryExpenses}
                variant="secondary"
                isLoading={expensesLoading}
                testID="group-expenses-retry-button"
              />
            </FeedbackBanner>
          ) : null}

          {!group && isLoading ? (
            <Card>
              <Stack gap="sm">
                <Skeleton height={24} width="60%" />
                <Skeleton height={16} width="85%" />
              </Stack>
            </Card>
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
                <Text size="sm" weight="bold" color={colors.textMuted}>
                  BALANCES
                </Text>
                {expensesError &&
                visibleBalances.length === 0 ? null : expensesLoading &&
                  visibleBalances.length === 0 ? (
                  <Card>
                    <Stack gap="sm">
                      <Skeleton height={20} width="60%" />
                      <Skeleton height={18} width="45%" />
                    </Stack>
                  </Card>
                ) : !balancesLoaded && !expensesError ? (
                  <Card>
                    <Text size="sm" color={colors.textMuted}>
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
                  <Card>
                    {visibleBalances.map((balance, index) => (
                      <Fragment key={balance.userId}>
                        {index > 0 && <Divider />}
                        <BalanceRow
                          name={
                            balance.userId === user?.id
                              ? "You"
                              : balance.displayName
                          }
                          amount={balance.netBalance}
                          testID={`group-balance-${balance.userId}`}
                        />
                      </Fragment>
                    ))}
                  </Card>
                )}
              </Stack>

              <Stack gap="sm">
                <Text size="sm" weight="bold" color={colors.textMuted}>
                  RECENT EXPENSES
                </Text>
                {expensesError &&
                groupExpenses.length === 0 ? null : expensesLoading &&
                  groupExpenses.length === 0 ? (
                  <Card>
                    <Stack gap="sm">
                      <Skeleton height={22} width="55%" />
                      <Skeleton height={16} width="80%" />
                    </Stack>
                  </Card>
                ) : groupExpenses.length === 0 ? (
                  <EmptyState
                    icon="receipt-outline"
                    title="No group expenses"
                    description="Add an expense to start tracking shared costs."
                  />
                ) : (
                  <Card flush>
                    {/* Store keeps them newest first. */}
                    {groupExpenses
                      .slice(0, RECENT_EXPENSES)
                      .map((expense, index) => (
                        <Fragment key={expense.id}>
                          {index > 0 && <Divider />}
                          <GroupExpenseRow expense={expense} />
                        </Fragment>
                      ))}
                    {groupExpenses.length > RECENT_EXPENSES ? (
                      <>
                        <Divider />
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
                      </>
                    ) : null}
                  </Card>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </View>

      {group ? (
        <Sheet
          visible={codeOpen}
          onClose={() => setCodeOpen(false)}
          title="Invite code"
          testID="group-invite-code-sheet"
        >
          <Text size="sm" color={colors.textMuted}>
            Share this code with people you want to add. An admin approves each
            request.
          </Text>
          <MaskedValue
            label="Code"
            value={group.inviteCode}
            shareMessage={`Join "${group.name}" on Lumin with invite code ${group.inviteCode}`}
            testID="group-invite-code"
          />
        </Sheet>
      ) : null}
    </Screen>
  );
}
