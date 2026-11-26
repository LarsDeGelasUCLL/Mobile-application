import { CardList, ListRow } from "../../../components/primitives";
import { useI18n } from "../../../i18n";

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
  const { t } = useI18n();
  return (
    <CardList testID={testID}>
      {canLeave ? (
        <ListRow
          icon="exit-outline"
          label={t("groups.settings.leave")}
          destructive
          onPress={onLeave}
          testID="leave-group-button"
        />
      ) : null}
      {canDelete ? (
        <ListRow
          icon="trash-outline"
          label={t("groups.settings.delete")}
          destructive
          onPress={onDelete}
          testID="delete-group-button"
        />
      ) : null}
    </CardList>
  );
}
