import { Card, Divider, ListRow, Sheet } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import { memberName } from "../memberName";
import type { GroupRole, MembershipDto } from "../../../types";

interface MemberActionsSheetProps {
  member: MembershipDto | null;
  visible: boolean;
  onClose: () => void;
  onChangeRole: (membershipId: string, role: GroupRole) => void;
  onRemove: () => void;
  testID?: string;
}

/** Admin actions for one member: toggle admin/member, remove from group. */
export function MemberActionsSheet({
  member,
  visible,
  onClose,
  onChangeRole,
  onRemove,
  testID,
}: MemberActionsSheetProps) {
  const { t } = useI18n();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={member ? memberName(member, t) : undefined}
      testID={testID}
    >
      {member ? (
        <Card flush>
          <ListRow
            icon="shield-outline"
            label={t(
              member.groupRole === "ADMIN"
                ? "groups.members.makeMember"
                : "groups.members.makeAdmin",
            )}
            onPress={() =>
              onChangeRole(
                member.id,
                member.groupRole === "ADMIN" ? "MEMBER" : "ADMIN",
              )
            }
            testID="group-member-role-button"
          />
          <Divider />
          <ListRow
            icon="person-remove-outline"
            label={t("groups.members.remove")}
            destructive
            onPress={onRemove}
            testID="group-member-remove-button"
          />
        </Card>
      ) : null}
    </Sheet>
  );
}
