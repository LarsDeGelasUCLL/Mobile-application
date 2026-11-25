import { CardList, ListRow } from "../../../components/primitives";

interface GroupDangerZoneProps {
  canLeave: boolean;
  canDelete: boolean;
  onLeave: () => void;
  onDelete: () => void;
  testID?: string;
}

/** "Leave group" (members) and "Delete group" (admins) rows. */
export function GroupDangerZone({
  canLeave,
  canDelete,
  onLeave,
  onDelete,
  testID,
}: GroupDangerZoneProps) {
  return (
    <CardList testID={testID}>
      {canLeave ? (
        <ListRow
          icon="exit-outline"
          label="Leave group"
          destructive
          onPress={onLeave}
          testID="leave-group-button"
        />
      ) : null}
      {canDelete ? (
        <ListRow
          icon="trash-outline"
          label="Delete group"
          destructive
          onPress={onDelete}
          testID="delete-group-button"
        />
      ) : null}
    </CardList>
  );
}
