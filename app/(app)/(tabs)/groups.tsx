import { Tabs } from "expo-router";
import {
  FeedbackBanner,
  IconButton,
  Screen,
  Stack,
} from "../../../src/components/primitives";
import { useI18n } from "../../../src/i18n";
import { AddGroupSheet } from "../../../src/features/groups/components/AddGroupSheet";
import { GroupList } from "../../../src/features/groups/components/GroupList";
import { InvitationList } from "../../../src/features/groups/components/InvitationList";
import { SentRequestList } from "../../../src/features/groups/components/SentRequestList";
import { useGroupsTab } from "../../../src/features/groups/useGroupsTab";

export default function GroupsScreen() {
  const { t } = useI18n();
  const page = useGroupsTab();
  const { isLoading, storeError } = page;
  const openCreate = () => page.openPage("/group/create");
  const openJoin = () => page.openPage("/group/join");

  return (
    <Screen
      padding="lg"
      refreshing={isLoading}
      onRefresh={page.loadGroups}
      testID="groups-screen"
    >
      <Tabs.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon="add"
              accessibilityLabel={t("groups.tab.add")}
              onPress={page.openMenu}
              testID="groups-add-button"
            />
          ),
        }}
      />
      <Stack gap="lg">
        {storeError ? (
          <FeedbackBanner
            tone="error"
            message={storeError}
            onRetry={page.loadGroups}
            isRetrying={isLoading}
            retryTestID="groups-retry-button"
            testID="groups-error"
          />
        ) : null}
        {page.feedback ? (
          <FeedbackBanner
            tone="success"
            message={page.feedback}
            testID="groups-feedback"
          />
        ) : null}

        <GroupList
          groups={page.groups}
          joinRequestCounts={page.joinRequestCounts}
          isLoading={isLoading}
          hasError={!!storeError}
          onOpenGroup={page.openGroup}
          onCreate={openCreate}
          onJoin={openJoin}
        />
        <InvitationList
          invites={page.pendingInvites}
          isLoading={isLoading}
          onRespond={page.respondToInvitation}
          testID="groups-invitations"
        />
        <SentRequestList
          requests={page.sentJoinRequests}
          isLoading={isLoading}
          onCancel={page.cancelRequest}
          testID="groups-sent-requests"
        />
      </Stack>

      <AddGroupSheet
        visible={page.menuOpen}
        onClose={page.closeMenu}
        onCreate={openCreate}
        onJoin={openJoin}
        testID="groups-add-sheet"
      />
    </Screen>
  );
}
