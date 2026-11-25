import { useState } from "react";
import { router } from "expo-router";
import { useGroupDetail } from "./useGroupDetail";
import { useActionFeedback } from "../shared/useActionFeedback";
import { useGroupStore } from "../../state/useGroupStore";
import type { GroupRole, MembershipDto } from "../../types";

type ConfirmKind = "leave" | "delete" | "remove";

/** The group settings page: the loaded group plus the admin actions (edit,
 * invite, join requests, roles, remove), leave and delete, with their
 * success feedback, member sheet and confirm dialogs. */
export function useGroupSettings(groupId: string | undefined) {
  const detail = useGroupDetail(groupId);
  const { user, group, currentMembership } = detail;
  const updateGroup = useGroupStore((state) => state.updateGroup);
  const deleteGroup = useGroupStore((state) => state.deleteGroup);
  const inviteMemberByEmail = useGroupStore(
    (state) => state.inviteMemberByEmail,
  );
  const changeMemberRole = useGroupStore((state) => state.changeMemberRole);
  const leaveOrRemoveMember = useGroupStore(
    (state) => state.leaveOrRemoveMember,
  );
  const approveJoinRequest = useGroupStore((state) => state.approveJoinRequest);
  const rejectJoinRequest = useGroupStore((state) => state.rejectJoinRequest);
  const setSelectedGroupId = useGroupStore((state) => state.setSelectedGroupId);
  const clearError = useGroupStore((state) => state.clearError);

  const { feedback, run } = useActionFeedback(clearError);
  const [selectedMember, setSelectedMember] = useState<MembershipDto | null>(
    null,
  );
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);

  /** Takes validated form values; resolves whether the save succeeded. */
  const saveGroupInfo = async (name: string, description: string) => {
    if (!group) return false;
    return run(
      () =>
        updateGroup(group.id, {
          name: name.trim(),
          description: description.trim() || null,
        }),
      "Group details updated.",
    );
  };

  /** Takes a validated email; resolves whether the invitation was sent. */
  const inviteByEmail = async (email: string) => {
    if (!group || !user?.id) return false;
    return run(
      () => inviteMemberByEmail(group.id, user.id, email.trim()),
      "Invitation sent.",
    );
  };

  const respondToJoinRequest = (membershipId: string, approve: boolean) =>
    void run(
      () =>
        approve
          ? approveJoinRequest(membershipId)
          : rejectJoinRequest(membershipId),
      approve ? "Join request approved." : "Join request rejected.",
    );

  const changeRole = (membershipId: string, role: GroupRole) => {
    setSelectedMember(null);
    void run(
      () => changeMemberRole(membershipId, role),
      `Member role changed to ${role}.`,
    );
  };

  const confirmRemove = async () => {
    if (!user?.id || !group || !selectedMember) return;
    await run(
      () => leaveOrRemoveMember(user.id, selectedMember.id, group.id),
      "Member removed.",
    );
    setConfirm(null);
    // Close the sheet either way, so an error banner is not hidden behind it.
    setSelectedMember(null);
  };

  const leaveOrDelete = async (kind: "leave" | "delete") => {
    const membershipId = currentMembership?.id;
    if (!user?.id || !group || (kind === "leave" && !membershipId)) return;
    const done = await run(
      () =>
        kind === "delete" || !membershipId
          ? deleteGroup(group.id, user.id)
          : leaveOrRemoveMember(user.id, membershipId, group.id),
      "",
    );
    setConfirm(null);
    if (!done) return;
    setSelectedGroupId(null);
    // Pops the now-dead group detail too, back to the Groups tab.
    router.dismissTo("/groups");
  };

  return {
    ...detail,
    feedback,
    selectedMember,
    setSelectedMember,
    confirm,
    setConfirm,
    saveGroupInfo,
    inviteByEmail,
    respondToJoinRequest,
    changeRole,
    confirmRemove,
    confirmLeave: () => leaveOrDelete("leave"),
    confirmDelete: () => leaveOrDelete("delete"),
  };
}
