/**
 * Reloads the user's groups, then the members of `groupId` if the user is
 * still an active member. Resolves `false` when they are not (left, removed,
 * deleted or never joined), so the page can show "unavailable".
 */
export async function loadGroupDetail(
  userId: string,
  groupId: string,
  fetchGroupsAndInvites: (userId: string) => Promise<void>,
  fetchMembersForGroup: (groupId: string) => Promise<void>,
  hasGroup: (groupId: string) => boolean,
): Promise<boolean> {
  await fetchGroupsAndInvites(userId);
  if (!hasGroup(groupId)) return false;
  await fetchMembersForGroup(groupId);
  return true;
}
