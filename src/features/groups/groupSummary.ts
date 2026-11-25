/**
 * The role line under a group in the Groups tab: "Member", "Admin", or
 * "Admin · 2 requests" when an admin has join requests waiting.
 */
export function groupSummary(
  groupId: string,
  isAdmin: boolean,
  joinRequestCounts: Readonly<Record<string, number>>,
): string {
  const requests = isAdmin ? (joinRequestCounts[groupId] ?? 0) : 0;
  const role = isAdmin ? "Admin" : "Member";
  return requests > 0
    ? `${role} · ${requests} ${requests === 1 ? "request" : "requests"}`
    : role;
}
