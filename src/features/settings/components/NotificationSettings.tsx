import {
  Card,
  Checkbox,
  SectionHeader,
  Stack,
} from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import type { UpdateUserSettingsDto, UserSettingsDto } from "../../../types";

interface NotificationSettingsProps {
  settings: Pick<
    UserSettingsDto,
    "notifyNewExpense" | "notifyReminders" | "notifyGroupUpdates"
  >;
  /** Gets the one changed setting. */
  onSave: (payload: UpdateUserSettingsDto) => void;
  testID?: string;
}

/** "NOTIFICATIONS": one checkbox per notification kind. */
export function NotificationSettings({
  settings,
  onSave,
  testID,
}: NotificationSettingsProps) {
  const { t } = useI18n();
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title={t("settings.notifications.title")} />
      <Card>
        <Checkbox
          label={t("settings.notifications.newExpenses")}
          checked={settings.notifyNewExpense}
          onChange={(notifyNewExpense) => onSave({ notifyNewExpense })}
        />
        <Checkbox
          label={t("settings.notifications.reminders")}
          checked={settings.notifyReminders}
          onChange={(notifyReminders) => onSave({ notifyReminders })}
        />
        <Checkbox
          label={t("settings.notifications.groupUpdates")}
          checked={settings.notifyGroupUpdates}
          onChange={(notifyGroupUpdates) => onSave({ notifyGroupUpdates })}
        />
      </Card>
    </Stack>
  );
}
