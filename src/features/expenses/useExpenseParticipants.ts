import { useCallback, useEffect, useMemo, useState } from "react";
import { includeCurrentUser } from "./expenseParticipants";
import { useAuthStore } from "../../state/useAuthStore";
import { useExpenseStore } from "../../state/useExpenseStore";
import { useGroupStore } from "../../state/useGroupStore";
import { getErrorMessage } from "../../utils/errors";
import type { PublicUserProfileDto } from "../../types";

const participantsErrorFallback = "Could not load participants.";

/**
 * Who can take part in an expense, always including the current user:
 * the group's active members, or (personal, `groupId` null) everyone from
 * the user's groups and personal history.
 *
 * Loads on mount and when `groupId` changes. With `autoLoad: false` the page
 * loads instead: `runLoad` wraps its own steps in this hook's loading/error
 * state and `fetchParticipants` is the participant step (the edit page first
 * loads the expense, which tells it the group).
 */
export function useExpenseParticipants(
  groupId: string | null,
  { autoLoad = true }: { autoLoad?: boolean } = {},
) {
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
  const [isLoading, setIsLoading] = useState(false);
  // `participants` always holds the current user, so length cannot signal the first load.
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const participants = useMemo(() => {
    if (!groupId) return includeCurrentUser(personalParticipants, user);
    const profiles = activeGroupMembers
      .filter(
        (member) => member.groupId === groupId && member.status === "ACTIVE",
      )
      .flatMap((member) => (member.userProfile ? [member.userProfile] : []));
    return includeCurrentUser(profiles, user);
  }, [activeGroupMembers, groupId, personalParticipants, user]);

  /** Loads the participants of `forGroupId`; throws on failure. */
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

  /** Runs `load` as this hook's load: loading flag, error banner text, loaded flag. */
  const runLoad = useCallback(async (load: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    try {
      await load();
    } catch (loadError) {
      setError(getErrorMessage(loadError, participantsErrorFallback));
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  }, []);

  const reload = useCallback(async () => {
    if (!userId) return;
    await runLoad(() => fetchParticipants(groupId));
  }, [fetchParticipants, groupId, runLoad, userId]);

  useEffect(() => {
    if (autoLoad) void reload();
  }, [autoLoad, reload]);

  return {
    participants,
    isLoading,
    isLoaded,
    error,
    reload,
    runLoad,
    fetchParticipants,
  };
}
