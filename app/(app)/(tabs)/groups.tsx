import { Fragment, useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { router, Tabs } from "expo-router";
import {
  Card,
  CollapsibleSection,
  Divider,
  EmptyState,
  FeedbackBanner,
  IconButton,
  ListRow,
  Row,
  Screen,
  Sheet,
  Skeleton,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useGroupStore } from "../../../src/state/useGroupStore";
import { makeStyles, useTheme } from "../../../src/theme/ThemeProvider";

export default function GroupsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
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
  const respondToInvite = useGroupStore((state) => state.respondToInvite);
  const clearError = useGroupStore((state) => state.clearError);

  const [menuOpen, setMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const loadGroups = useCallback(() => {
    if (user?.id) {
      void fetchGroupsAndInvites(user.id).catch(() => undefined);
    }
  }, [fetchGroupsAndInvites, user?.id]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const openPage = (path: "/group/create" | "/group/join") => {
    setMenuOpen(false);
    router.push(path);
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

  const groupSummary = (groupId: string, isAdmin: boolean) => {
    const requests = isAdmin ? (joinRequestCounts[groupId] ?? 0) : 0;
    const role = isAdmin ? "Admin" : "Member";
    return requests > 0
      ? `${role} · ${requests} ${requests === 1 ? "request" : "requests"}`
      : role;
  };

  return (
    <Screen padding="lg" refreshing={isLoading} onRefresh={loadGroups}>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon="add"
              accessibilityLabel="Create or join a group"
              onPress={() => setMenuOpen(true)}
              color={colors.text}
              testID="groups-add-button"
            />
          ),
        }}
      />
      <View testID="groups-screen">
        <Stack gap="lg">
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

          <Stack gap="sm">
            <Text size="sm" weight="bold" color={colors.textMuted}>
              YOUR GROUPS
            </Text>
            {storeError && groups.length === 0 ? null : isLoading &&
              groups.length === 0 ? (
              <Card>
                <Stack gap="sm">
                  <Skeleton height={22} width="60%" />
                  <Skeleton height={16} width="35%" />
                </Stack>
              </Card>
            ) : groups.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No groups yet"
                description="Create a group, or join friends with an invite code."
                action={
                  <Stack gap="sm">
                    <StyledButton
                      label="Create group"
                      onPress={() => openPage("/group/create")}
                      testID="groups-empty-create"
                    />
                    <StyledButton
                      label="Join with code"
                      onPress={() => openPage("/group/join")}
                      variant="link"
                      testID="groups-empty-join"
                    />
                  </Stack>
                }
              />
            ) : (
              <Card flush>
                {groups.map(({ group, groupRole }, index) => (
                  <Fragment key={group.id}>
                    {index > 0 && <Divider />}
                    <ListRow
                      icon="people-outline"
                      label={group.name}
                      description={groupSummary(
                        group.id,
                        groupRole === "ADMIN",
                      )}
                      onPress={() =>
                        router.push({
                          pathname: "/group/[groupId]",
                          params: { groupId: group.id },
                        })
                      }
                      testID={`group-row-${group.id}`}
                    />
                  </Fragment>
                ))}
              </Card>
            )}
          </Stack>

          {pendingInvites.length > 0 ? (
            <CollapsibleSection
              title="Invitations"
              count={pendingInvites.length}
              testID="groups-invitations"
            >
              {pendingInvites.map((invite, index) => (
                <Stack gap="sm" key={invite.membershipId}>
                  {index > 0 && <Divider />}
                  <Text weight="bold">{invite.group.name}</Text>
                  <Text size="sm" color={colors.textMuted}>
                    {invite.invitedByProfile
                      ? `Invited by ${invite.invitedByProfile.displayName}`
                      : "You have been invited to this group."}
                  </Text>
                  <Row gap="sm">
                    <View style={styles.buttonColumn}>
                      <StyledButton
                        label="Accept"
                        onPress={() =>
                          void handleInviteResponse(invite.membershipId, true)
                        }
                        variant="secondary"
                        isLoading={isLoading}
                        testID={`accept-invite-${invite.membershipId}`}
                      />
                    </View>
                    <View style={styles.buttonColumn}>
                      <StyledButton
                        label="Decline"
                        onPress={() =>
                          void handleInviteResponse(invite.membershipId, false)
                        }
                        variant="secondary"
                        isLoading={isLoading}
                        testID={`decline-invite-${invite.membershipId}`}
                      />
                    </View>
                  </Row>
                </Stack>
              ))}
            </CollapsibleSection>
          ) : null}

          {sentJoinRequests.length > 0 ? (
            <CollapsibleSection
              title="Sent join requests"
              count={sentJoinRequests.length}
              testID="groups-sent-requests"
            >
              {sentJoinRequests.map((request, index) => (
                <Stack gap="sm" key={request.membershipId}>
                  {index > 0 && <Divider />}
                  <Text weight="bold">{request.group.name}</Text>
                  <Text size="sm" color={colors.textMuted}>
                    Requested{" "}
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </Text>
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
              ))}
            </CollapsibleSection>
          ) : null}
        </Stack>
      </View>

      <Sheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Add a group"
        testID="groups-add-sheet"
      >
        <Card flush>
          <ListRow
            icon="add-circle-outline"
            label="Create group"
            description="Start a new group and invite people."
            onPress={() => openPage("/group/create")}
            testID="groups-menu-create"
          />
          <Divider />
          <ListRow
            icon="enter-outline"
            label="Join with code"
            description="Use an invite code from a group admin."
            onPress={() => openPage("/group/join")}
            testID="groups-menu-join"
          />
        </Card>
      </Sheet>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  buttonColumn: { flex: 1 },
}));
