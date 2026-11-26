import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useActionFeedback } from "../shared/useActionFeedback";
import { useI18n } from "../../i18n";
import { useAuthStore } from "../../state/useAuthStore";
import { useGroupStore } from "../../state/useGroupStore";

/** The Groups tab: groups, invitations and sent join requests, the add-group
 * sheet, and the invitation / join request actions with their feedback. */
export function useGroupsTab() {
  const { t } = useI18n();
  const userId = useAuthStore((state) => state.user?.id);
  const {
    groups,
    pendingInvites,
    sentJoinRequests,
    joinRequestCounts,
    isLoading,
    storeError,
    fetchGroupsAndInvites,
    cancelJoinRequest,
    respondToInvite,
    clearError,
  } = useGroupStore(
    useShallow((state) => ({
      groups: state.groups,
      pendingInvites: state.pendingInvites,
      sentJoinRequests: state.sentJoinRequests,
      joinRequestCounts: state.joinRequestCounts,
      isLoading: state.isLoading,
      storeError: state.error,
      fetchGroupsAndInvites: state.fetchGroupsAndInvites,
      cancelJoinRequest: state.cancelJoinRequest,
      respondToInvite: state.respondToInvite,
      clearError: state.clearError,
    })),
  );

  // The add-group sheet (create or join).
  const [menuOpen, setMenuOpen] = useState(false);
  const { feedback, run } = useActionFeedback(clearError);

  // Load failures show through the store error banner.
  const loadGroups = useCallback(() => {
    if (userId) {
      void fetchGroupsAndInvites(userId).catch(() => undefined);
    }
  }, [fetchGroupsAndInvites, userId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const openPage = (path: "/group/create" | "/group/join") => {
    setMenuOpen(false);
    router.push(path);
  };

  const openGroup = (groupId: string) =>
    router.push({ pathname: "/group/[groupId]", params: { groupId } });

  const cancelRequest = (membershipId: string) =>
    void run(
      () => cancelJoinRequest(membershipId),
      t("groups.feedback.requestCancelled"),
    );

  const respondToInvitation = (membershipId: string, accept: boolean) => {
    if (!userId) return;
    void run(
      () => respondToInvite(userId, membershipId, accept),
      t(
        accept
          ? "groups.feedback.invitationAccepted"
          : "groups.feedback.invitationDeclined",
      ),
    );
  };

  return {
    groups,
    pendingInvites,
    sentJoinRequests,
    joinRequestCounts,
    isLoading,
    storeError,
    feedback,
    loadGroups,
    menuOpen,
    openMenu: () => setMenuOpen(true),
    closeMenu: () => setMenuOpen(false),
    openPage,
    openGroup,
    cancelRequest,
    respondToInvitation,
  };
}
