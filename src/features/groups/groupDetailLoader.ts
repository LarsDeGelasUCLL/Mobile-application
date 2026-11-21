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
