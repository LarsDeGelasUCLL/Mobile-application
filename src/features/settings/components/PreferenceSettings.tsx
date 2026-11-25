import {
  Card,
  SectionHeader,
  Select,
  Stack,
  Text,
  type SelectOption,
} from "../../../components/primitives";
import type {
  UiTheme,
  UpdateUserSettingsDto,
  UserSettingsDto,
} from "../../../types";

const themes: SelectOption<UiTheme>[] = [
  { label: "System", value: "SYSTEM" },
  { label: "Light", value: "LIGHT" },
  { label: "Dark", value: "DARK" },
];

const languages: SelectOption<string>[] = [
  { label: "English", value: "en" },
  { label: "Nederlands", value: "nl" },
];

interface PreferenceSettingsProps {
  settings: Pick<UserSettingsDto, "uiTheme" | "languageCode">;
  /** Gets the one changed setting. */
  onSave: (payload: UpdateUserSettingsDto) => void;
  testID?: string;
}

/** "PREFERENCES": theme and language dropdowns. */
export function PreferenceSettings({
  settings,
  onSave,
  testID,
}: PreferenceSettingsProps) {
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title="PREFERENCES" />
      <Card>
        <Stack gap="md">
          <Select
            label="Theme"
            value={settings.uiTheme}
            options={themes}
            onChange={(uiTheme) => onSave({ uiTheme })}
            testID="settings-theme-select"
          />
          <Select
            label="Language"
            value={settings.languageCode}
            options={languages}
            onChange={(languageCode) => onSave({ languageCode })}
            testID="settings-language-select"
          />
          <Text size="sm" tone="muted">
            Both are saved to your account. Translations follow in a later
            update.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
