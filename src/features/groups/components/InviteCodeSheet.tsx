import { MaskedValue, Sheet, Text } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
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
  const { t } = useI18n();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t("groups.inviteCode.title")}
      testID={testID}
    >
      <Text size="sm" tone="muted">
        {t("groups.inviteCode.hint")}
      </Text>
      <MaskedValue
        label={t("groups.inviteCode.label")}
        value={group.inviteCode}
        shareMessage={t("groups.inviteCode.shareMessage", {
          name: group.name,
          code: group.inviteCode,
        })}
        testID="group-invite-code"
      />
    </Sheet>
  );
}
