import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  FeedbackBanner,
  InputField,
  Row,
  Screen,
  Skeleton,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import {
  validateGroupName,
  validateInviteEmail,
} from "../../../src/features/groups/groupValidation";
import { loadGroupDetail } from "../../../src/features/groups/groupDetailLoader";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { useExpenseStore } from "../../../src/state/useExpenseStore";
import type { GroupRole, UpdateGroupDto } from "../../../src/types";
import { colors } from "../../../src/theme/colors";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const user = useAuthStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);
  const allActiveGroupMembers = useGroupStore(
    (state) => state.activeGroupMembers,
  );
  const activeGroupMembers = allActiveGroupMembers.filter(
    (membership) => membership.groupId === groupId,
  );
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const fetchMembersForGroup = useGroupStore(
    (state) => state.fetchMembersForGroup,
  );
  const updateGroup = useGroupStore((state) => state.updateGroup);
  const deleteGroup = useGroupStore((state) => state.deleteGroup);
  const inviteMemberByEmail = useGroupStore(
    (state) => state.inviteMemberByEmail,
  );
  const changeMemberRole = useGroupStore((state) => state.changeMemberRole);
  const leaveOrRemoveMember = useGroupStore(
    (state) => state.leaveOrRemoveMember,
  );
  const setSelectedGroupId = useGroupStore((state) => state.setSelectedGroupId);
  const clearError = useGroupStore((state) => state.clearError);
  const expensesInStore = useExpenseStore((state) => state.groupExpenses);
  const groupBalances = useExpenseStore((state) => state.groupBalances);
  const groupBalancesGroupId = useExpenseStore(
    (state) => state.groupBalancesGroupId,
  );
  const expensesLoading = useExpenseStore((state) => state.isLoading);
  const expensesError = useExpenseStore((state) => state.error);
  const fetchGroupExpensesAndBalances = useExpenseStore(
    (state) => state.fetchGroupExpensesAndBalances,
  );
  const clearExpenseError = useExpenseStore((state) => state.clearError);

  const groupMembership = groups.find((item) => item.group.id === groupId);
  const group = groupMembership?.group;
  const groupExpenses = expensesInStore.filter(
    (expense) => expense.groupId === groupId,
  );
  const visibleBalances = groupBalancesGroupId === groupId ? groupBalances : [];
  const isAdmin = groupMembership?.groupRole === "ADMIN";
  const currentMembership = activeGroupMembers.find(
    (membership) => membership.userId === user?.id,
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmRemovalId, setConfirmRemovalId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const loadGroup = useCallback(async () => {
    if (!user?.id || !groupId) return;
    clearError();
    clearExpenseError();
    try {
      const isActive = await loadGroupDetail(
        user.id,
        groupId,
        fetchGroupsAndInvites,
        fetchMembersForGroup,
        (id) =>
          useGroupStore.getState().groups.some((item) => item.group.id === id),
      );
      if (!isActive) {
        setSelectedGroupId(null);
        return;
      }
      await fetchGroupExpensesAndBalances(groupId);
    } catch {
      // The relevant store exposes the load failure for its retry banner.
    }
  }, [
    clearError,
    clearExpenseError,
    fetchGroupExpensesAndBalances,
    fetchGroupsAndInvites,
    fetchMembersForGroup,
    groupId,
    setSelectedGroupId,
    user?.id,
  ]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description ?? "");
    }
  }, [group?.id, group?.name, group?.description]);

  const handleUpdateGroup = async () => {
    const validationError = validateGroupName(name);
    setNameError(validationError);
    setFeedback("");
    clearError();
    if (validationError || !group) return;

    const payload: UpdateGroupDto = {
      name: name.trim(),
      description: description.trim() || null,
    };
    try {
      await updateGroup(group.id, payload);
      setFeedback("Group details updated.");
    } catch {
      setFeedback("");
    }
  };

  const handleInvite = async () => {
    const validationError = validateInviteEmail(email);
    setEmailError(validationError);
    setFeedback("");
    clearError();
    if (validationError || !group || !user?.id) return;

    try {
      await inviteMemberByEmail(group.id, user.id, email.trim());
      setEmail("");
      setFeedback("Invitation sent.");
    } catch {
      setFeedback("");
    }
  };

  const handleRoleChange = async (membershipId: string, role: GroupRole) => {
    setFeedback("");
    clearError();
    try {
      await changeMemberRole(membershipId, role);
      setFeedback(`Member role changed to ${role}.`);
    } catch {
      setFeedback("");
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!user?.id || !group) return;
    setFeedback("");
    clearError();
    try {
      await leaveOrRemoveMember(user.id, membershipId, group.id);
      setConfirmRemovalId(null);
      setFeedback("Member removed.");
    } catch {
      setFeedback("");
    }
  };

  const handleLeaveGroup = async () => {
    if (!user?.id || !group || !currentMembership) return;
    setFeedback("");
    clearError();
    try {
      await leaveOrRemoveMember(user.id, currentMembership.id, group.id);
      setSelectedGroupId(null);
      router.replace("/groups");
    } catch {
      setFeedback("");
    }
  };

  const handleDeleteGroup = async () => {
    if (!user?.id || !group) return;
    setFeedback("");
    clearError();
    try {
      await deleteGroup(group.id, user.id);
      setSelectedGroupId(null);
      router.replace("/groups");
    } catch {
      setFeedback("");
    }
  };

  return (
    <Screen
      padding="lg"
      refreshing={isLoading || expensesLoading}
      onRefresh={() => void loadGroup()}
    >
      <View style={styles.container} testID="group-detail-screen">
        <Stack gap="lg">
          <Row justify="space-between" align="center">
            <Stack gap="sm" flex={1}>
              <Text size="xl" weight="bold">
                {group?.name ?? "Group"}
              </Text>
              <Text size="sm" color={colors.muted}>
                Group details and members
              </Text>
            </Stack>
            <View style={styles.backButton}>
              <StyledButton
                label="Back"
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/groups");
                  }
                }}
                variant="secondary"
              />
            </View>
          </Row>

          {storeError ? (
            <FeedbackBanner tone="error" testID="group-detail-error">
              <Text size="sm" color={colors.error}>
                {storeError}
              </Text>
              <StyledButton
                label="Retry"
                onPress={() => void loadGroup()}
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
                onPress={() =>
                  void fetchGroupExpensesAndBalances(groupId).catch(
                    () => undefined,
                  )
                }
                variant="secondary"
                isLoading={expensesLoading}
                testID="group-expenses-retry-button"
              />
            </FeedbackBanner>
          ) : null}

          {feedback ? (
            <FeedbackBanner tone="success" testID="group-feedback">
              <Text size="sm" color={colors.success}>
                {feedback}
              </Text>
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
              <Card>
                <Stack gap="sm">
                  <Text size="sm" color={colors.muted}>
                    Share this invite code with people you want to add.
                  </Text>
                  <Text size="md" weight="bold">
                    {group.inviteCode}
                  </Text>
                </Stack>
              </Card>

              <Stack gap="sm">
                <Row justify="space-between" align="center">
                  <Text size="lg" weight="bold">
                    Expenses and balances
                  </Text>
                  <View style={styles.actionColumn}>
                    <StyledButton
                      label="Add expense"
                      onPress={() =>
                        router.push({
                          pathname: "/expense/create",
                          params: { groupId },
                        })
                      }
                      variant="secondary"
                      testID="create-group-expense-button"
                    />
                  </View>
                </Row>

                <Text size="md" weight="bold">
                  Group balances
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
                ) : groupBalancesGroupId !== groupId && !expensesError ? (
                  <Card>
                    <Text size="sm" color={colors.muted}>
                      Balances are loading.
                    </Text>
                  </Card>
                ) : visibleBalances.length === 0 ? (
                  <EmptyState
                    title="No balances yet"
                    description="Balances appear after your group records its first expense."
                  />
                ) : (
                  visibleBalances.map((balance) => (
                    <Card key={balance.userId}>
                      <Row justify="space-between" align="center">
                        <Text weight="medium">{balance.displayName}</Text>
                        <Text
                          weight="bold"
                          color={
                            balance.netBalance > 0
                              ? colors.success
                              : balance.netBalance < 0
                                ? colors.error
                                : colors.muted
                          }
                        >
                          {balance.netBalance === 0
                            ? "Settled up"
                            : balance.netBalance > 0
                              ? `Owed ${formatCurrency(balance.netBalance)}`
                              : `Owes ${formatCurrency(-balance.netBalance)}`}
                        </Text>
                      </Row>
                    </Card>
                  ))
                )}

                <Text size="md" weight="bold">
                  Recent expenses
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
                    title="No group expenses"
                    description="Add an expense to start tracking shared costs."
                    action={
                      <StyledButton
                        label="Add expense"
                        onPress={() =>
                          router.push({
                            pathname: "/expense/create",
                            params: { groupId },
                          })
                        }
                      />
                    }
                  />
                ) : (
                  groupExpenses.map((expense) => (
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
                              "Group member"}
                          </Text>
                        </Stack>
                        <Text weight="bold">
                          {formatCurrency(expense.amount)}
                        </Text>
                      </Row>
                    </Card>
                  ))
                )}
              </Stack>

              <Stack gap="sm">
                <Text size="lg" weight="bold">
                  Active members
                </Text>
                {isLoading && activeGroupMembers.length === 0 ? (
                  <Card>
                    <Stack gap="sm">
                      <Skeleton height={44} />
                      <Skeleton height={44} />
                    </Stack>
                  </Card>
                ) : activeGroupMembers.length === 0 ? (
                  <EmptyState
                    title="No active members"
                    description="Active group members will appear here."
                  />
                ) : (
                  activeGroupMembers.map((membership) => {
                    const isCurrentUser = membership.userId === user?.id;
                    return (
                      <Card key={membership.id}>
                        <Stack gap="md">
                          <Row gap="sm" justify="space-between">
                            <Row gap="sm" align="center">
                              <Avatar
                                name={
                                  membership.userProfile?.displayName ??
                                  "Group member"
                                }
                                uri={
                                  membership.userProfile?.profilePictureUrl ??
                                  undefined
                                }
                                size="sm"
                              />
                              <Stack gap="none">
                                <Text weight="medium">
                                  {membership.userProfile?.displayName ??
                                    "Group member"}
                                  {isCurrentUser ? " (you)" : ""}
                                </Text>
                                <Text size="sm" color={colors.muted}>
                                  Joined{" "}
                                  {new Date(
                                    membership.joinedAt,
                                  ).toLocaleDateString()}
                                </Text>
                              </Stack>
                            </Row>
                            <Badge
                              label={membership.groupRole}
                              variant={
                                membership.groupRole === "ADMIN"
                                  ? "warning"
                                  : "default"
                              }
                            />
                          </Row>
                          {isAdmin && !isCurrentUser ? (
                            <Row gap="sm">
                              <View style={styles.actionColumn}>
                                <StyledButton
                                  label={
                                    membership.groupRole === "ADMIN"
                                      ? "Make member"
                                      : "Make admin"
                                  }
                                  onPress={() =>
                                    void handleRoleChange(
                                      membership.id,
                                      membership.groupRole === "ADMIN"
                                        ? "MEMBER"
                                        : "ADMIN",
                                    )
                                  }
                                  variant="secondary"
                                  isLoading={isLoading}
                                />
                              </View>
                              <View style={styles.actionColumn}>
                                {confirmRemovalId === membership.id ? (
                                  <StyledButton
                                    label="Confirm remove"
                                    onPress={() =>
                                      void handleRemoveMember(membership.id)
                                    }
                                    isLoading={isLoading}
                                  />
                                ) : (
                                  <StyledButton
                                    label="Remove"
                                    onPress={() =>
                                      setConfirmRemovalId(membership.id)
                                    }
                                    variant="secondary"
                                  />
                                )}
                              </View>
                            </Row>
                          ) : null}
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>

              {isAdmin ? (
                <>
                  <Card>
                    <Stack gap="md">
                      <Text size="md" weight="bold">
                        Invite by email
                      </Text>
                      <InputField
                        label="Email address"
                        value={email}
                        onChangeText={(value) => {
                          setEmail(value);
                          setEmailError(undefined);
                        }}
                        placeholder="friend@example.com"
                        keyboardType="email-address"
                        error={emailError}
                        testID="group-invite-email-input"
                      />
                      <StyledButton
                        label="Send invitation"
                        onPress={() => void handleInvite()}
                        isLoading={isLoading}
                        testID="group-invite-button"
                      />
                    </Stack>
                  </Card>

                  <Card>
                    <Stack gap="md">
                      <Text size="md" weight="bold">
                        Group settings
                      </Text>
                      <InputField
                        label="Group name"
                        value={name}
                        onChangeText={(value) => {
                          setName(value);
                          setNameError(undefined);
                        }}
                        error={nameError}
                        testID="group-name-input"
                      />
                      <InputField
                        label="Description"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add a short description"
                        testID="group-description-input"
                      />
                      <StyledButton
                        label="Save group"
                        onPress={() => void handleUpdateGroup()}
                        variant="secondary"
                        isLoading={isLoading}
                        testID="update-group-button"
                      />
                      {confirmDelete ? (
                        <Row gap="sm">
                          <View style={styles.actionColumn}>
                            <StyledButton
                              label="Confirm delete"
                              onPress={() => void handleDeleteGroup()}
                              isLoading={isLoading}
                              testID="confirm-delete-group-button"
                            />
                          </View>
                          <View style={styles.actionColumn}>
                            <StyledButton
                              label="Cancel"
                              onPress={() => setConfirmDelete(false)}
                              variant="secondary"
                            />
                          </View>
                        </Row>
                      ) : (
                        <StyledButton
                          label="Delete group"
                          onPress={() => setConfirmDelete(true)}
                          variant="secondary"
                          testID="delete-group-button"
                        />
                      )}
                    </Stack>
                  </Card>
                </>
              ) : null}

              {currentMembership ? (
                confirmLeave ? (
                  <Row gap="sm">
                    <View style={styles.actionColumn}>
                      <StyledButton
                        label="Confirm leave"
                        onPress={() => void handleLeaveGroup()}
                        isLoading={isLoading}
                      />
                    </View>
                    <View style={styles.actionColumn}>
                      <StyledButton
                        label="Cancel"
                        onPress={() => setConfirmLeave(false)}
                        variant="secondary"
                      />
                    </View>
                  </Row>
                ) : (
                  <StyledButton
                    label="Leave group"
                    onPress={() => setConfirmLeave(true)}
                    variant="secondary"
                    testID="leave-group-button"
                  />
                )
              ) : null}
            </>
          )}
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionColumn: {
    flex: 1,
  },
  backButton: {
    width: 76,
  },
});
