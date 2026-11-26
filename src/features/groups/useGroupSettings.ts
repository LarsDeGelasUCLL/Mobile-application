import { useState } from "react";
import { router } from "expo-router";
import { useShallow } from "zustand/react/shallow";
import { useGroupDetail } from "./useGroupDetail";
import { useActionFeedback } from "../shared/useActionFeedback";
import { useI18n } from "../../i18n";
import { useGroupStore } from "../../state/useGroupStore";
import type { GroupRole, MembershipDto } from "../../types";

type ConfirmKind = "leave" | "delete" | "remove";

/** The group settings page: the loaded group plus the admin actions (edit,
 * invite, join requests, roles, remove), leave and delete, with their
 * success feedback, member sheet and confirm dialogs. */
export function useGroupSettings(groupId: string | undefined) {
  const { t } = useI18n();
  const detail = useGroupDetail(groupId);
  const { user, group, currentMembership } = detail;
  const {
    updateGroup,
    deleteGroup,
    inviteMemberByEmail,
    changeMemberRole,
    leaveOrRemoveMember,
    approveJoinRequest,
    rejectJoinRequest,
    setSelectedGroupId,
    clearError,
  } = useGroupStore(
    useShallow((state) => ({
      updateGroup: state.updateGroup,
      deleteGroup: state.deleteGroup,
      inviteMemberByEmail: state.inviteMemberByEmail,
      changeMemberRole: state.changeMemberRole,
      leaveOrRemoveMember: state.leaveOrRemoveMember,
      approveJoinRequest: state.approveJoinRequest,
      rejectJoinRequest: state.rejectJoinRequest,
      setSelectedGroupId: state.setSelectedGroupId,
      clearError: state.clearError,
    })),
  );

  const { feedback, run } = useActionFeedback(clearError);
  const [selectedMember, setSelectedMember] = useState<MembershipDto | null>(
    null,
  );
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);

  /** Takes validated form values. */
  const saveGroupInfo = (name: string, description: string) => {
    if (!group) return;
    void run(
      () =>
        updateGroup(group.id, {
          name: name.trim(),
          description: description.trim() || null,
        }),
      t("groups.feedback.updated"),
    );
  };

  /** Takes a validated email; resolves whether the invitation was sent. */
  const inviteByEmail = async (email: string) => {
    if (!group || !user?.id) return false;
    return run(
      () => inviteMemberByEmail(group.id, user.id, email.trim()),
      t("groups.feedback.invitationSent"),
    );
  };

  const respondToJoinRequest = (membershipId: string, approve: boolean) =>
    void run(
      () =>
        approve
          ? approveJoinRequest(membershipId)
          : rejectJoinRequest(membershipId),
      t(
        approve
          ? "groups.feedback.requestApproved"
          : "groups.feedback.requestRejected",
      ),
    );

  const changeRole = (membershipId: string, role: GroupRole) => {
    setSelectedMember(null);
    void run(
      () => changeMemberRole(membershipId, role),
      t("groups.feedback.roleChanged", {
        role: t(role === "ADMIN" ? "groups.role.admin" : "groups.role.member"),
      }),
    );
  };

  const confirmRemove = async () => {
    if (!user?.id || !group || !selectedMember) return;
    await run(
      () => leaveOrRemoveMember(user.id, selectedMember.id, group.id),
      t("groups.feedback.memberRemoved"),
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
    openMemberActions: (member: MembershipDto) => setSelectedMember(member),
    closeMemberActions: () => setSelectedMember(null),
    confirm,
    askConfirm: (kind: ConfirmKind) => setConfirm(kind),
    closeConfirm: () => setConfirm(null),
    saveGroupInfo,
    inviteByEmail,
    respondToJoinRequest,
    changeRole,
    confirmRemove,
    confirmLeave: () => leaveOrDelete("leave"),
    confirmDelete: () => leaveOrDelete("delete"),
  };
}
