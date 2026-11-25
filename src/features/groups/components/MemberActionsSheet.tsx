import { Card, Divider, ListRow, Sheet } from "../../../components/primitives";
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
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={member ? memberName(member) : undefined}
      testID={testID}
    >
      {member ? (
        <Card flush>
          <ListRow
            icon="shield-outline"
            label={member.groupRole === "ADMIN" ? "Make member" : "Make admin"}
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
            label="Remove from group"
            destructive
            onPress={onRemove}
            testID="group-member-remove-button"
          />
        </Card>
      ) : null}
    </Sheet>
  );
}
