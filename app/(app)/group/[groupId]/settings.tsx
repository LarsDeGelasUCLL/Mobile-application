import { Fragment, useEffect, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Avatar,
  Card,
  CollapsibleSection,
  ConfirmDialog,
  Divider,
  EmptyState,
  FeedbackBanner,
  InputField,
  ListRow,
  Row,
  Screen,
  ScreenHeader,
  Sheet,
  Skeleton,
  Stack,
  Text,
} from "../../../../src/components/primitives";
import { StyledButton } from "../../../../src/components/common/StyledButton";
import {
  validateGroupName,
  validateInviteEmail,
} from "../../../../src/features/groups/groupValidation";
import { useGroupDetail } from "../../../../src/features/groups/useGroupDetail";
import { useGroupStore } from "../../../../src/state/useGroupStore";
import type { MembershipDto, GroupRole } from "../../../../src/types";
import { makeStyles, useTheme } from "../../../../src/theme/ThemeProvider";

export default function GroupSettingsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const {
    user,
    group,
    isAdmin,
    members,
    currentMembership,
    joinRequests,
    isLoading,
    storeError,
    reload,
  } = useGroupDetail(groupId);
  const updateGroup = useGroupStore((state) => state.updateGroup);
  const deleteGroup = useGroupStore((state) => state.deleteGroup);
  const inviteMemberByEmail = useGroupStore(
    (state) => state.inviteMemberByEmail,
  );
  const changeMemberRole = useGroupStore((state) => state.changeMemberRole);
  const leaveOrRemoveMember = useGroupStore(
    (state) => state.leaveOrRemoveMember,
  );
  const approveJoinRequest = useGroupStore((state) => state.approveJoinRequest);
  const rejectJoinRequest = useGroupStore((state) => state.rejectJoinRequest);
  const setSelectedGroupId = useGroupStore((state) => state.setSelectedGroupId);
  const clearError = useGroupStore((state) => state.clearError);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState<string>();
  const [emailError, setEmailError] = useState<string>();
  const [feedback, setFeedback] = useState("");
  const [selectedMember, setSelectedMember] = useState<MembershipDto | null>(
    null,
  );
  const [confirm, setConfirm] = useState<"leave" | "delete" | "remove" | null>(
    null,
  );

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description ?? "");
    }
  }, [group?.id, group?.name, group?.description]);

  // Runs a store action; the store holds the error message for the banner.
  const run = async (action: () => Promise<unknown>, success: string) => {
    setFeedback("");
    clearError();
    try {
      await action();
      setFeedback(success);
      return true;
    } catch {
      return false;
    }
  };

  const handleUpdateGroup = () => {
    const validationError = validateGroupName(name);
    setNameError(validationError);
    if (validationError || !group) return;
    void run(
      () =>
        updateGroup(group.id, {
          name: name.trim(),
          description: description.trim() || null,
        }),
      "Group details updated.",
    );
  };

  const handleInvite = async () => {
    const validationError = validateInviteEmail(email);
    setEmailError(validationError);
    if (validationError || !group || !user?.id) return;
    const sent = await run(
      () => inviteMemberByEmail(group.id, user.id, email.trim()),
      "Invitation sent.",
    );
    if (sent) setEmail("");
  };

  const handleJoinRequest = (membershipId: string, approve: boolean) =>
    void run(
      () =>
        approve
          ? approveJoinRequest(membershipId)
          : rejectJoinRequest(membershipId),
      approve ? "Join request approved." : "Join request rejected.",
    );

  const handleRoleChange = (membershipId: string, role: GroupRole) => {
    setSelectedMember(null);
    void run(
      () => changeMemberRole(membershipId, role),
      `Member role changed to ${role}.`,
    );
  };

  const handleRemoveMember = async () => {
    if (!user?.id || !group || !selectedMember) return;
    await run(
      () => leaveOrRemoveMember(user.id, selectedMember.id, group.id),
      "Member removed.",
    );
    setConfirm(null);
    // Close the sheet either way, so an error banner is not hidden behind it.
    setSelectedMember(null);
  };

  const handleLeaveOrDelete = async (kind: "leave" | "delete") => {
    const membershipId = currentMembership?.id;
    if (!user?.id || !group || (kind === "leave" && !membershipId)) return;
    const done = await run(
      () =>
        kind === "delete" || !membershipId
          ? deleteGroup(group.id, user.id)
          : leaveOrRemoveMember(user.id, membershipId, group.id),
      "",
    );
    setConfirm(null);
    if (!done) return;
    setSelectedGroupId(null);
    // Pops the now-dead group detail too, back to the Groups tab.
    router.dismissTo("/groups");
  };

  const memberName = (member: MembershipDto) =>
    member.userProfile?.displayName ?? "Group member";

  return (
    <Screen padding="lg" refreshing={isLoading} onRefresh={() => void reload()}>
      <View testID="group-settings-screen">
        <Stack gap="lg">
          <ScreenHeader
            title="Group settings"
            subtitle={group?.name}
            onBack={() =>
              router.canGoBack()
                ? router.back()
                : router.replace({
                    pathname: "/group/[groupId]",
                    params: { groupId },
                  })
            }
            testID="group-settings-header"
          />

          {storeError ? (
            <FeedbackBanner tone="error" testID="group-settings-error">
              <Text size="sm" color={colors.error}>
                {storeError}
              </Text>
              <StyledButton
                label="Retry"
                onPress={() => void reload()}
                variant="secondary"
                isLoading={isLoading}
                testID="group-settings-retry-button"
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
                <Skeleton height={44} />
                <Skeleton height={44} />
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
                  onPress={() => router.dismissTo("/groups")}
                  variant="secondary"
                />
              }
            />
          ) : (
            <>
              {isAdmin ? (
                <CollapsibleSection
                  title="Group info"
                  testID="group-info-section"
                >
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
                    label="Save changes"
                    onPress={handleUpdateGroup}
                    variant="secondary"
                    isLoading={isLoading}
                    testID="update-group-button"
                  />
                </CollapsibleSection>
              ) : null}

              {isAdmin && joinRequests.length > 0 ? (
                <Stack gap="sm">
                  <Text size="sm" weight="bold" color={colors.textMuted}>
                    JOIN REQUESTS ({joinRequests.length})
                  </Text>
                  <Card>
                    <Stack gap="md">
                      {joinRequests.map((request, index) => (
                        <Stack gap="sm" key={request.id}>
                          {index > 0 && <Divider />}
                          <Row gap="sm" align="center">
                            <Avatar
                              name={memberName(request)}
                              uri={
                                request.userProfile?.profilePictureUrl ??
                                undefined
                              }
                              size="sm"
                            />
                            <Stack gap="none" flex={1}>
                              <Text weight="medium">{memberName(request)}</Text>
                              <Text size="sm" color={colors.textMuted}>
                                Requested{" "}
                                {new Date(
                                  request.joinedAt,
                                ).toLocaleDateString()}
                              </Text>
                            </Stack>
                          </Row>
                          <Row gap="sm">
                            <View style={styles.buttonColumn}>
                              <StyledButton
                                label="Approve"
                                onPress={() =>
                                  handleJoinRequest(request.id, true)
                                }
                                variant="secondary"
                                isLoading={isLoading}
                                testID={`join-request-approve-${request.id}`}
                              />
                            </View>
                            <View style={styles.buttonColumn}>
                              <StyledButton
                                label="Reject"
                                onPress={() =>
                                  handleJoinRequest(request.id, false)
                                }
                                variant="secondary"
                                isLoading={isLoading}
                                testID={`join-request-reject-${request.id}`}
                              />
                            </View>
                          </Row>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Stack>
              ) : null}

              <Stack gap="sm">
                <Text size="sm" weight="bold" color={colors.textMuted}>
                  MEMBERS ({members.length})
                </Text>
                {isLoading && members.length === 0 ? (
                  <Card>
                    <Stack gap="sm">
                      <Skeleton height={44} />
                      <Skeleton height={44} />
                    </Stack>
                  </Card>
                ) : (
                  <Card flush>
                    {members.map((member, index) => {
                      const isCurrentUser = member.userId === user?.id;
                      return (
                        <Fragment key={member.id}>
                          {index > 0 && <Divider />}
                          <ListRow
                            leading={
                              <Avatar
                                name={memberName(member)}
                                uri={
                                  member.userProfile?.profilePictureUrl ??
                                  undefined
                                }
                                size="sm"
                              />
                            }
                            label={`${memberName(member)}${isCurrentUser ? " (you)" : ""}`}
                            description={
                              member.groupRole === "ADMIN" ? "Admin" : "Member"
                            }
                            onPress={
                              isAdmin && !isCurrentUser
                                ? () => setSelectedMember(member)
                                : undefined
                            }
                            testID={`group-member-${member.id}`}
                          />
                        </Fragment>
                      );
                    })}
                  </Card>
                )}
              </Stack>

              {isAdmin ? (
                <CollapsibleSection
                  title="Invite by email"
                  testID="group-invite-section"
                >
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
                    variant="secondary"
                    isLoading={isLoading}
                    testID="group-invite-button"
                  />
                </CollapsibleSection>
              ) : null}

              <Card flush>
                {currentMembership ? (
                  <ListRow
                    icon="exit-outline"
                    label="Leave group"
                    destructive
                    onPress={() => setConfirm("leave")}
                    testID="leave-group-button"
                  />
                ) : null}
                {isAdmin ? (
                  <>
                    {currentMembership ? <Divider /> : null}
                    <ListRow
                      icon="trash-outline"
                      label="Delete group"
                      destructive
                      onPress={() => setConfirm("delete")}
                      testID="delete-group-button"
                    />
                  </>
                ) : null}
              </Card>
            </>
          )}
        </Stack>
      </View>

      <Sheet
        visible={selectedMember !== null && confirm === null}
        onClose={() => setSelectedMember(null)}
        title={selectedMember ? memberName(selectedMember) : undefined}
        testID="group-member-sheet"
      >
        {selectedMember ? (
          <Card flush>
            <ListRow
              icon="shield-outline"
              label={
                selectedMember.groupRole === "ADMIN"
                  ? "Make member"
                  : "Make admin"
              }
              onPress={() =>
                handleRoleChange(
                  selectedMember.id,
                  selectedMember.groupRole === "ADMIN" ? "MEMBER" : "ADMIN",
                )
              }
              testID="group-member-role-button"
            />
            <Divider />
            <ListRow
              icon="person-remove-outline"
              label="Remove from group"
              destructive
              onPress={() => setConfirm("remove")}
              testID="group-member-remove-button"
            />
          </Card>
        ) : null}
      </Sheet>

      <ConfirmDialog
        visible={confirm === "remove"}
        title={`Remove ${selectedMember ? memberName(selectedMember) : "member"}?`}
        message={`They lose access to '${group?.name ?? "this group"}'.`}
        confirmLabel="Remove"
        onConfirm={() => void handleRemoveMember()}
        onCancel={() => setConfirm(null)}
        isLoading={isLoading}
        testID="remove-member-dialog"
      />
      <ConfirmDialog
        visible={confirm === "leave"}
        title={`Leave '${group?.name ?? "group"}'?`}
        message="You need a new invite or an approved request to come back."
        confirmLabel="Leave group"
        onConfirm={() => void handleLeaveOrDelete("leave")}
        onCancel={() => setConfirm(null)}
        isLoading={isLoading}
        testID="leave-group-dialog"
      />
      <ConfirmDialog
        visible={confirm === "delete"}
        title={`Delete '${group?.name ?? "group"}'?`}
        message="This deletes the group, its members and its expenses for everyone."
        confirmLabel="Delete group"
        onConfirm={() => void handleLeaveOrDelete("delete")}
        onCancel={() => setConfirm(null)}
        isLoading={isLoading}
        testID="delete-group-dialog"
      />
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  buttonColumn: { flex: 1 },
}));
