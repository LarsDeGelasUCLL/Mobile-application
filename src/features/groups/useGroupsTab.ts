import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { useActionFeedback } from "../shared/useActionFeedback";
import { useAuthStore } from "../../state/useAuthStore";
import { useGroupStore } from "../../state/useGroupStore";

/** The Groups tab: groups, invitations and sent join requests, the add-group
 * sheet, and the invitation / join request actions with their feedback. */
export function useGroupsTab() {
  const userId = useAuthStore((state) => state.user?.id);
  const groups = useGroupStore((state) => state.groups);
  const pendingInvites = useGroupStore((state) => state.pendingInvites);
  const sentJoinRequests = useGroupStore((state) => state.sentJoinRequests);
  const joinRequestCounts = useGroupStore((state) => state.joinRequestCounts);
  const isLoading = useGroupStore((state) => state.isLoading);
  const storeError = useGroupStore((state) => state.error);
  const fetchGroupsAndInvites = useGroupStore(
    (state) => state.fetchGroupsAndInvites,
  );
  const cancelJoinRequest = useGroupStore((state) => state.cancelJoinRequest);
  const respondToInvite = useGroupStore((state) => state.respondToInvite);
  const clearError = useGroupStore((state) => state.clearError);

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
    setMenuOpen,
    openPage,
    openGroup,
    cancelRequest,
    respondToInvitation,
  };
}
