import { Card, Divider, ListRow, Sheet } from "../../../components/primitives";
import { useI18n } from "../../../i18n";

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
  const { t } = useI18n();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t("groups.addSheet.title")}
      testID={testID}
    >
      <Card flush>
        <ListRow
          icon="add-circle-outline"
          label={t("groups.create.title")}
          description={t("groups.addSheet.createText")}
          onPress={onCreate}
          testID="groups-menu-create"
        />
        <Divider />
        <ListRow
          icon="enter-outline"
          label={t("groups.join.title")}
          description={t("groups.addSheet.joinText")}
          onPress={onJoin}
          testID="groups-menu-join"
        />
      </Card>
    </Sheet>
  );
}
