import { Card, Divider, ListRow, Sheet } from "../../../components/primitives";

interface AddGroupSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
  onJoin: () => void;
  testID?: string;
}

/** The Groups tab "+" sheet: create a group or join one with a code. */
export function AddGroupSheet({
  visible,
  onClose,
  onCreate,
  onJoin,
  testID,
}: AddGroupSheetProps) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Add a group"
      testID={testID}
    >
      <Card flush>
        <ListRow
          icon="add-circle-outline"
          label="Create group"
          description="Start a new group and invite people."
          onPress={onCreate}
          testID="groups-menu-create"
        />
        <Divider />
        <ListRow
          icon="enter-outline"
          label="Join with code"
          description="Use an invite code from a group admin."
          onPress={onJoin}
          testID="groups-menu-join"
        />
      </Card>
    </Sheet>
  );
}
