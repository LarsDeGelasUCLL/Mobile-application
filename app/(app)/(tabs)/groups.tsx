import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
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
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import {
  validateGroupName,
  validateInviteCode,
} from "../../../src/features/groups/groupValidation";
import { colors } from "../../../src/theme/colors";

export default function GroupsScreen() {
  const user = useAuthStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);
  const pendingInvites = useGroupStore((state) => state.pendingInvites);
  const sentJoinRequests = useGroupStore((state) => state.sentJoinRequests);
  const joinRequestCounts = useGroupStore((state) => state.joinRequestCounts);
  const cancelJoinRequest = useGroupStore((state) => state.cancelJoinRequest);
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const createNewGroup = useGroupStore((state) => state.createNewGroup);
  const joinByCode = useGroupStore((state) => state.joinByCode);
  const respondToInvite = useGroupStore((state) => state.respondToInvite);
  const clearError = useGroupStore((state) => state.clearError);

  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [groupNameError, setGroupNameError] = useState<string>();
  const [inviteCodeError, setInviteCodeError] = useState<string>();
  const [feedback, setFeedback] = useState("");

  const loadGroups = useCallback(() => {
    if (user?.id) {
      void fetchGroupsAndInvites(user.id).catch(() => undefined);
    }
  }, [fetchGroupsAndInvites, user?.id]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleCreateGroup = async () => {
    const validationError = validateGroupName(groupName);
    setGroupNameError(validationError);
    setFeedback("");
    clearError();
    if (validationError || !user?.id) return;

    try {
      await createNewGroup(user.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
      });
      setGroupName("");
      setGroupDescription("");
      setFeedback("Your group was created.");
    } catch {
      setFeedback("");
    }
  };

  const handleJoinGroup = async () => {
    const validationError = validateInviteCode(inviteCode);
    setInviteCodeError(validationError);
    setFeedback("");
    clearError();
    if (validationError || !user?.id) return;

    try {
      const { status } = await joinByCode(user.id, inviteCode.trim());
      setInviteCode("");
      setFeedback(
        status === "ACTIVE"
          ? "You joined the group."
          : "Request sent. A group admin must approve it.",
      );
    } catch {
      setFeedback("");
    }
  };

  const handleCancelRequest = async (membershipId: string) => {
    setFeedback("");
    clearError();
    try {
      await cancelJoinRequest(membershipId);
      setFeedback("Join request cancelled.");
    } catch {
      setFeedback("");
    }
  };

  const handleInviteResponse = async (
    membershipId: string,
    accept: boolean,
  ) => {
    if (!user?.id) return;
    setFeedback("");
    clearError();
    try {
      await respondToInvite(user.id, membershipId, accept);
      setFeedback(accept ? "Invitation accepted." : "Invitation declined.");
    } catch {
      setFeedback("");
    }
  };

  return (
    <Screen padding="lg" refreshing={isLoading} onRefresh={loadGroups}>
      <View style={styles.container} testID="groups-screen">
        <Stack gap="lg">
          <Row justify="space-between" align="center">
            <Stack gap="none">
              <Text size="xl" weight="bold">
                Your groups
              </Text>
              <Text size="sm" color={colors.muted}>
                Shared plans, made easier to manage
              </Text>
            </Stack>
            <Badge
              label={`${groups.length} ${groups.length === 1 ? "group" : "groups"}`}
            />
          </Row>

          {storeError ? (
            <FeedbackBanner tone="error" testID="groups-error">
              <Text size="sm" color={colors.error}>
                {storeError}
              </Text>
              <StyledButton
                label="Retry"
                onPress={loadGroups}
                variant="secondary"
                isLoading={isLoading}
                testID="groups-retry-button"
              />
            </FeedbackBanner>
          ) : null}

          {feedback ? (
            <FeedbackBanner tone="success" testID="groups-feedback">
              <Text size="sm" color={colors.success}>
                {feedback}
              </Text>
            </FeedbackBanner>
          ) : null}

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Create a group
              </Text>
              <InputField
                label="Group name"
                value={groupName}
                onChangeText={(value) => {
                  setGroupName(value);
                  setGroupNameError(undefined);
                }}
                placeholder="Weekend trip"
                error={groupNameError}
                testID="create-group-name-input"
              />
              <InputField
                label="Description (optional)"
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="What are you planning together?"
                testID="create-group-description-input"
              />
              <StyledButton
                label="Create group"
                onPress={() => void handleCreateGroup()}
                isLoading={isLoading}
                testID="create-group-button"
              />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Join a group
              </Text>
              <Text size="sm" color={colors.muted}>
                A group admin must approve your request, unless they already
                invited you.
              </Text>
              <InputField
                label="Invite code"
                value={inviteCode}
                onChangeText={(value) => {
                  setInviteCode(value);
                  setInviteCodeError(undefined);
                }}
                placeholder="Enter your invite code"
                error={inviteCodeError}
                testID="join-group-code-input"
              />
              <StyledButton
                label="Join with code"
                onPress={() => void handleJoinGroup()}
                variant="secondary"
                isLoading={isLoading}
                testID="join-group-button"
              />
            </Stack>
          </Card>

          <Stack gap="sm">
            <Row justify="space-between" align="center">
              <Text size="lg" weight="bold">
                Active groups
              </Text>
              <Badge label={String(groups.length)} variant="success" />
            </Row>
            {storeError && groups.length === 0 ? null : isLoading &&
              groups.length === 0 ? (
              <Card>
                <Stack gap="sm">
                  <Skeleton height={22} width="60%" />
                  <Skeleton height={16} width="85%" />
                  <Skeleton height={16} width="35%" />
                </Stack>
              </Card>
            ) : groups.length === 0 ? (
              <EmptyState
                title="No active groups"
                description="Create a group or join friends with an invite code. Groups you belong to will appear here."
              />
            ) : (
              groups.map(({ group, groupRole }) => (
                <Card
                  key={group.id}
                  onPress={() =>
                    router.push({
                      pathname: "/group/[groupId]",
                      params: { groupId: group.id },
                    })
                  }
                >
                  <Stack gap="sm">
                    <Row justify="space-between" align="center">
                      <Text size="md" weight="bold">
                        {group.name}
                      </Text>
                      <Row gap="sm" align="center">
                        {groupRole === "ADMIN" &&
                        joinRequestCounts[group.id] > 0 ? (
                          <Badge
                            label={`${joinRequestCounts[group.id]} ${joinRequestCounts[group.id] === 1 ? "request" : "requests"}`}
                            variant="error"
                            testID={`group-join-request-count-${group.id}`}
                          />
                        ) : null}
                        <Badge
                          label={groupRole}
                          variant={
                            groupRole === "ADMIN" ? "warning" : "default"
                          }
                        />
                      </Row>
                    </Row>
                    {group.description ? (
                      <Text size="sm" color={colors.muted}>
                        {group.description}
                      </Text>
                    ) : null}
                    <Text size="sm" color={colors.primary}>
                      View group
                    </Text>
                  </Stack>
                </Card>
              ))
            )}
          </Stack>

          <Stack gap="sm">
            <Row justify="space-between" align="center">
              <Text size="lg" weight="bold">
                Invitations
              </Text>
              <Badge label={String(pendingInvites.length)} />
            </Row>
            {storeError && pendingInvites.length === 0 ? null : isLoading &&
              pendingInvites.length === 0 ? (
              <Card>
                <Stack gap="sm">
                  <Skeleton height={22} width="55%" />
                  <Skeleton height={16} width="75%" />
                </Stack>
              </Card>
            ) : pendingInvites.length === 0 ? (
              <EmptyState
                title="No pending invitations"
                description="Invitations sent to you will show up here."
              />
            ) : (
              pendingInvites.map((invite) => (
                <Card key={invite.membershipId}>
                  <Stack gap="md">
                    <Stack gap="sm">
                      <Text size="md" weight="bold">
                        {invite.group.name}
                      </Text>
                      <Text size="sm" color={colors.muted}>
                        {invite.invitedByProfile
                          ? `Invited by ${invite.invitedByProfile.displayName}`
                          : "You have been invited to this group."}
                      </Text>
                    </Stack>
                    <Row gap="sm">
                      <View style={styles.buttonColumn}>
                        <StyledButton
                          label="Accept"
                          onPress={() =>
                            void handleInviteResponse(invite.membershipId, true)
                          }
                          isLoading={isLoading}
                          testID={`accept-invite-${invite.membershipId}`}
                        />
                      </View>
                      <View style={styles.buttonColumn}>
                        <StyledButton
                          label="Decline"
                          onPress={() =>
                            void handleInviteResponse(
                              invite.membershipId,
                              false,
                            )
                          }
                          variant="secondary"
                          isLoading={isLoading}
                          testID={`decline-invite-${invite.membershipId}`}
                        />
                      </View>
                    </Row>
                  </Stack>
                </Card>
              ))
            )}
          </Stack>

          <Stack gap="sm">
            <Row justify="space-between" align="center">
              <Text size="lg" weight="bold">
                Sent requests
              </Text>
              <Badge label={String(sentJoinRequests.length)} />
            </Row>
            {storeError && sentJoinRequests.length === 0 ? null : isLoading &&
              sentJoinRequests.length === 0 ? (
              <Card>
                <Stack gap="sm">
                  <Skeleton height={22} width="55%" />
                  <Skeleton height={16} width="40%" />
                </Stack>
              </Card>
            ) : sentJoinRequests.length === 0 ? (
              <EmptyState
                title="No open join requests"
                description="Groups you asked to join with an invite code will show up here until an admin responds."
              />
            ) : (
              sentJoinRequests.map((request) => (
                <Card key={request.membershipId}>
                  <Stack gap="md">
                    <Stack gap="sm">
                      <Text size="md" weight="bold">
                        {request.group.name}
                      </Text>
                      <Text size="sm" color={colors.muted}>
                        Requested{" "}
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </Text>
                    </Stack>
                    <StyledButton
                      label="Cancel request"
                      onPress={() =>
                        void handleCancelRequest(request.membershipId)
                      }
                      variant="secondary"
                      isLoading={isLoading}
                      testID={`sent-request-cancel-${request.membershipId}`}
                    />
                  </Stack>
                </Card>
              ))
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
  buttonColumn: {
    flex: 1,
  },
});
