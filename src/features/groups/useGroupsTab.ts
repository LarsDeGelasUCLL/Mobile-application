import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useActionFeedback } from "../shared/useActionFeedback";
import { useAuthStore } from "../../state/useAuthStore";
import { useGroupStore } from "../../state/useGroupStore";

/** The Groups tab: groups, invitations and sent join requests, the add-group
 * sheet, and the invitation / join request actions with their feedback. */
export function useGroupsTab() {
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

  const [menuOpen, setMenuOpen] = useState(false);
  const { feedback, run } = useActionFeedback(clearError);

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
    void run(() => cancelJoinRequest(membershipId), "Join request cancelled.");

  const respondToInvitation = (membershipId: string, accept: boolean) => {
    if (!userId) return;
    void run(
      () => respondToInvite(userId, membershipId, accept),
      accept ? "Invitation accepted." : "Invitation declined.",
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
