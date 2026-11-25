import { useState } from "react";
import { router } from "expo-router";
import { useGroupDetail } from "./useGroupDetail";

/** The group detail page: the loaded group plus the invite-code sheet and
 * the links to add an expense, all expenses and group settings. */
export function useGroupDetailPage(groupId: string) {
  const detail = useGroupDetail(groupId);
  const [codeOpen, setCodeOpen] = useState(false);

  return {
    ...detail,
    codeOpen,
    openCode: () => setCodeOpen(true),
    closeCode: () => setCodeOpen(false),
    addExpense: () =>
      router.push({ pathname: "/expense/create", params: { groupId } }),
    openAllExpenses: () =>
      router.push({
        pathname: "/group/[groupId]/expenses",
        params: { groupId },
      }),
    openSettings: () =>
      router.push({
        pathname: "/group/[groupId]/settings",
        params: { groupId },
      }),
  };
}
