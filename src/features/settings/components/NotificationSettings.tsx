import {
  Card,
  Checkbox,
  SectionHeader,
  Stack,
} from "../../../components/primitives";
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
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="NOTIFICATIONS" />
      <Card>
        <Checkbox
          label="New group expenses"
          checked={settings.notifyNewExpense}
          onChange={(notifyNewExpense) => onSave({ notifyNewExpense })}
        />
        <Checkbox
          label="Payment reminders"
          checked={settings.notifyReminders}
          onChange={(notifyReminders) => onSave({ notifyReminders })}
        />
        <Checkbox
          label="New members and group updates"
          checked={settings.notifyGroupUpdates}
          onChange={(notifyGroupUpdates) => onSave({ notifyGroupUpdates })}
        />
      </Card>
    </Stack>
  );
}
