import { useCallback, useEffect } from "react";
import { router } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "../../state/useAuthStore";
import { useExpenseStore } from "../../state/useExpenseStore";
import { useGroupStore } from "../../state/useGroupStore";
import { openExpense } from "../expenses/openExpense";
import type { GroupHighlight } from "../../types";
import { summarizeBalances } from "../../utils/money";

/** Home: the user's groups, invitations and personal expenses, loaded on
 * open, with a retry per section and the balance summary. */
export function useHomePage() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const groupState = useGroupStore(
    useShallow((state) => ({
      groups: state.groups,
      pendingInvites: state.pendingInvites,
      isLoading: state.isLoading,
      error: state.error,
      fetchGroupsAndInvites: state.fetchGroupsAndInvites,
      clearError: state.clearError,
    })),
  );
  const expenseState = useExpenseStore(
    useShallow((state) => ({
      expenses: state.individualExpenses,
      isLoading: state.isLoading,
      error: state.error,
      fetchIndividualExpenses: state.fetchIndividualExpenses,
      clearError: state.clearError,
    })),
  );
  const { fetchGroupsAndInvites, clearError: clearGroupError } = groupState;
  const { fetchIndividualExpenses, clearError: clearExpenseError } =
    expenseState;

  const loadGroups = useCallback(() => {
    if (!userId) return;
    clearGroupError();
    void fetchGroupsAndInvites(userId).catch(() => undefined);
  }, [clearGroupError, fetchGroupsAndInvites, userId]);

  const loadExpenses = useCallback(() => {
    if (!userId) return;
    clearExpenseError();
    void fetchIndividualExpenses(userId).catch(() => undefined);
  }, [clearExpenseError, fetchIndividualExpenses, userId]);

  const loadHome = useCallback(() => {
    loadGroups();
    loadExpenses();
  }, [loadExpenses, loadGroups]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  const groupHighlights: GroupHighlight[] = groupState.groups.map(
    ({ group }) => ({
      id: group.id,
      name: group.name,
      imageUri: group.groupIconUrl ?? undefined,
    }),
  );
  // Personal expenses only: Home loads no group expenses (see AI_OVERVIEW §7).
  const balances = summarizeBalances(expenseState.expenses, userId ?? "");
  const pendingInviteCount = groupState.pendingInvites.length;

  return {
    userName: user?.displayName ?? "User",
    groupHighlights,
    pendingInviteCount,
    invitationLabel: `${pendingInviteCount} ${pendingInviteCount === 1 ? "invitation" : "invitations"}`,
    groupLoading: groupState.isLoading,
    groupError: groupState.error,
    expenses: expenseState.expenses,
    expenseLoading: expenseState.isLoading,
    expenseError: expenseState.error,
    balances,
    loadGroups,
    loadExpenses,
    loadHome,
    openGroups: () => router.push("/groups"),
    openGroup: (groupId: string) =>
      router.push({ pathname: "/group/[groupId]", params: { groupId } }),
    openExpenses: () => router.push("/expenses"),
    createExpense: () => router.push("/expense/create"),
    openExpense,
  };
}
