import { router, useLocalSearchParams } from "expo-router";
import { goBackOr } from "../../../../src/features/navigation/goBackOr";
import {
  ConfirmDialog,
  FeedbackBanner,
  Screen,
  ScreenHeader,
  SkeletonCard,
  Stack,
} from "../../../../src/components/primitives";
import { GroupDangerZone } from "../../../../src/features/groups/components/GroupDangerZone";
import { GroupInfoForm } from "../../../../src/features/groups/components/GroupInfoForm";
import { GroupUnavailableState } from "../../../../src/features/groups/components/GroupUnavailableState";
import { InviteByEmailForm } from "../../../../src/features/groups/components/InviteByEmailForm";
import { JoinRequestList } from "../../../../src/features/groups/components/JoinRequestList";
import { MemberActionsSheet } from "../../../../src/features/groups/components/MemberActionsSheet";
import { MemberList } from "../../../../src/features/groups/components/MemberList";
import { memberName } from "../../../../src/features/groups/memberName";
import { useGroupSettings } from "../../../../src/features/groups/useGroupSettings";

export default function GroupSettingsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const page = useGroupSettings(groupId);
  const { group, isAdmin, isLoading, joinRequests, selectedMember } = page;
  const closeDialog = () => page.setConfirm(null);

  return (
    <Screen
      padding="lg"
      refreshing={isLoading}
      onRefresh={() => void page.reload()}
      testID="group-settings-screen"
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Group settings"
          subtitle={group?.name}
          onBack={() =>
            goBackOr({ pathname: "/group/[groupId]", params: { groupId } })
          }
          testID="group-settings-header"
        />
        {page.storeError ? (
          <FeedbackBanner
            tone="error"
            message={page.storeError}
            onRetry={() => void page.reload()}
            isRetrying={isLoading}
            retryTestID="group-settings-retry-button"
            testID="group-settings-error"
          />
        ) : null}
        {page.feedback ? (
          <FeedbackBanner
            tone="success"
            message={page.feedback}
            testID="group-feedback"
          />
        ) : null}

        {!group && isLoading ? (
          <SkeletonCard lines={2} />
        ) : !group ? (
          <GroupUnavailableState onBack={() => router.dismissTo("/groups")} />
        ) : (
          <>
            {isAdmin ? (
              <GroupInfoForm
                key={group.id}
                group={group}
                isLoading={isLoading}
                onSave={page.saveGroupInfo}
                testID="group-info-section"
              />
            ) : null}
            {isAdmin && joinRequests.length > 0 ? (
              <JoinRequestList
                requests={joinRequests}
                isLoading={isLoading}
                onRespond={page.respondToJoinRequest}
              />
            ) : null}
            <MemberList
              members={page.members}
              currentUserId={page.user?.id}
              isLoading={isLoading}
              onSelect={isAdmin ? page.setSelectedMember : undefined}
            />
            {isAdmin ? (
              <InviteByEmailForm
                isLoading={isLoading}
                onInvite={page.inviteByEmail}
                testID="group-invite-section"
              />
            ) : null}
            <GroupDangerZone
              canLeave={!!page.currentMembership}
              canDelete={isAdmin}
              onLeave={() => page.setConfirm("leave")}
              onDelete={() => page.setConfirm("delete")}
            />
          </>
        )}
      </Stack>

      <MemberActionsSheet
        member={selectedMember}
        visible={selectedMember !== null && page.confirm === null}
        onClose={() => page.setSelectedMember(null)}
        onChangeRole={page.changeRole}
        onRemove={() => page.setConfirm("remove")}
        testID="group-member-sheet"
      />
      <ConfirmDialog
        visible={page.confirm === "remove"}
        title={`Remove ${selectedMember ? memberName(selectedMember) : "member"}?`}
        message={`They lose access to '${group?.name ?? "this group"}'.`}
        confirmLabel="Remove"
        onConfirm={() => void page.confirmRemove()}
        onCancel={closeDialog}
        isLoading={isLoading}
        testID="remove-member-dialog"
      />
      <ConfirmDialog
        visible={page.confirm === "leave"}
        title={`Leave '${group?.name ?? "group"}'?`}
        message="You need a new invite or an approved request to come back."
        confirmLabel="Leave group"
        onConfirm={() => void page.confirmLeave()}
        onCancel={closeDialog}
        isLoading={isLoading}
        testID="leave-group-dialog"
      />
      <ConfirmDialog
        visible={page.confirm === "delete"}
        title={`Delete '${group?.name ?? "group"}'?`}
        message="This deletes the group, its members and its expenses for everyone."
        confirmLabel="Delete group"
        onConfirm={() => void page.confirmDelete()}
        onCancel={closeDialog}
        isLoading={isLoading}
        testID="delete-group-dialog"
      />
    </Screen>
  );
}
