import {
  Card,
  SectionHeader,
  Select,
  Stack,
  Text,
  type SelectOption,
} from "../../../components/primitives";
import { languages, useI18n } from "../../../i18n";
import type {
  UiTheme,
  UpdateUserSettingsDto,
  UserSettingsDto,
} from "../../../types";

// Each language in its own name, so it reads the same in every language.
const languageOptions: SelectOption<string>[] = Object.entries(languages).map(
  ([value, { label }]) => ({ label, value }),
);

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
  const { t } = useI18n();
  const themes: SelectOption<UiTheme>[] = [
    { label: t("settings.theme.system"), value: "SYSTEM" },
    { label: t("settings.theme.light"), value: "LIGHT" },
    { label: t("settings.theme.dark"), value: "DARK" },
  ];
  return (
    <Stack gap="sm" testID={testID}>
      <SectionHeader title={t("settings.preferences.title")} />
      <Card>
        <Stack gap="md">
          <Select
            label={t("settings.preferences.theme")}
            value={settings.uiTheme}
            options={themes}
            onChange={(uiTheme) => onSave({ uiTheme })}
            testID="settings-theme-select"
          />
          <Select
            label={t("settings.preferences.language")}
            value={settings.languageCode}
            options={languageOptions}
            onChange={(languageCode) => onSave({ languageCode })}
            testID="settings-language-select"
          />
          <Text size="sm" tone="muted">
            {t("settings.preferences.savedNote")}
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
