import type { I18n } from "../../i18n";

/**
 * The role line under a group in the Groups tab: "Member", "Admin", or
 * "Admin · 2 requests" when an admin has join requests waiting.
 */
export function groupSummary(
  groupId: string,
  isAdmin: boolean,
  joinRequestCounts: Readonly<Record<string, number>>,
  t: I18n["t"],
): string {
  const requests = isAdmin ? (joinRequestCounts[groupId] ?? 0) : 0;
  const role = t(isAdmin ? "groups.role.admin" : "groups.role.member");
  return requests > 0
    ? t("groups.summary.requests", { role, count: requests })
    : role;
}
