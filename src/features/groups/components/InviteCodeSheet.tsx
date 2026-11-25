import { MaskedValue, Sheet, Text } from "../../../components/primitives";
import type { GroupDto } from "../../../types";

interface InviteCodeSheetProps {
  group: Pick<GroupDto, "name" | "inviteCode">;
  visible: boolean;
  onClose: () => void;
  testID?: string;
}

/** The group's invite code, masked until revealed, with copy and share. */
export function InviteCodeSheet({
  group,
  visible,
  onClose,
  testID,
}: InviteCodeSheetProps) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Invite code"
      testID={testID}
    >
      <Text size="sm" tone="muted">
        Share this code with people you want to add. An admin approves each
        request.
      </Text>
      <MaskedValue
        label="Code"
        value={group.inviteCode}
        shareMessage={`Join "${group.name}" on Laruna with invite code ${group.inviteCode}`}
        testID="group-invite-code"
      />
    </Sheet>
  );
}
