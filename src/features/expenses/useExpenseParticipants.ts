import { useCallback, useEffect, useMemo, useState } from "react";
import { includeCurrentUser } from "./expenseParticipants";
import { useLoadState } from "../shared/useLoadState";
import { useAuthStore } from "../../state/useAuthStore";
import { useExpenseStore } from "../../state/useExpenseStore";
import { useGroupStore } from "../../state/useGroupStore";
import type { TranslationKey } from "../../i18n";
import type { PublicUserProfileDto } from "../../types";

/** The message shown when loading participants fails. */
export const participantsErrorFallback: TranslationKey =
  "errors.fallback.loadParticipants";

/**
 * Who can take part in an expense, always including the current user: the
 * group's active members, or (personal, `groupId` null) everyone from the
 * user's groups and personal history. `fetchParticipants` loads them and
 * throws on failure; the caller owns the loading state.
 */
export function useParticipantOptions(groupId: string | null) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const fetchExpenseParticipants = useExpenseStore(
    (state) => state.fetchExpenseParticipants,
  );
  const clearExpenseError = useExpenseStore((state) => state.clearError);
  const activeGroupMembers = useGroupStore((state) => state.activeGroupMembers);
  const fetchMembersForGroup = useGroupStore(
    (state) => state.fetchMembersForGroup,
  );
  const clearGroupError = useGroupStore((state) => state.clearError);
  const [personalParticipants, setPersonalParticipants] = useState<
    PublicUserProfileDto[]
  >([]);

  const participants = useMemo(() => {
    if (!groupId) return includeCurrentUser(personalParticipants, user);
    const profiles = activeGroupMembers
      .filter(
        (member) => member.groupId === groupId && member.status === "ACTIVE",
      )
      .flatMap((member) => (member.userProfile ? [member.userProfile] : []));
    return includeCurrentUser(profiles, user);
  }, [activeGroupMembers, groupId, personalParticipants, user]);

  const fetchParticipants = useCallback(
    async (forGroupId: string | null) => {
      if (forGroupId) {
        clearGroupError();
        await fetchMembersForGroup(forGroupId);
        return;
      }
      if (!userId) return;
      clearExpenseError();
      setPersonalParticipants(await fetchExpenseParticipants(userId));
    },
    [
      clearExpenseError,
      clearGroupError,
      fetchExpenseParticipants,
      fetchMembersForGroup,
      userId,
    ],
  );

  return { participants, fetchParticipants };
}

/** The participant options, loaded on mount and when `groupId` changes. */
export function useExpenseParticipants(groupId: string | null) {
  const userId = useAuthStore((state) => state.user?.id);
  const { participants, fetchParticipants } = useParticipantOptions(groupId);
  // `participants` always holds the current user, so length cannot signal the first load.
  const { isLoading, isLoaded, error, run } = useLoadState(
    participantsErrorFallback,
  );

  const reload = useCallback(async () => {
    if (!userId) return;
    await run(() => fetchParticipants(groupId));
  }, [fetchParticipants, groupId, run, userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { participants, isLoading, isLoaded, error, reload };
}
