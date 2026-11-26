import { router } from "expo-router";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import { AccountLinks } from "../../../src/features/settings/components/AccountLinks";
import { LogoutRow } from "../../../src/features/settings/components/LogoutRow";
import { NotificationSettings } from "../../../src/features/settings/components/NotificationSettings";
import { PreferenceSettings } from "../../../src/features/settings/components/PreferenceSettings";
import { useLogout } from "../../../src/features/settings/useLogout";
import { useSettingsSaver } from "../../../src/features/settings/useSettingsSaver";
import { useAuthStore } from "../../../src/state/useAuthStore";
import type { UpdateUserSettingsDto } from "../../../src/types";
import {
  FeedbackBanner,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
  Text,
} from "../../../src/components/primitives";
import { useI18n } from "../../../src/i18n";

export default function SettingsScreen() {
  const { t } = useI18n();
  const email = useAuthStore((state) => state.user?.emailAddress);
  const saver = useSettingsSaver();
  const logout = useLogout();
  const { settings, pendingSettings } = saver;
  const save = (payload: UpdateUserSettingsDto) =>
    void saver.saveSettings(payload);

  return (
    <Screen padding="lg" testID="settings-screen">
      <Stack gap="lg">
        <ScreenHeader
          title={t("settings.title")}
          onBack={() => goBackOr("/profile")}
          testID="settings-header"
        />
        <AccountLinks email={email} onOpen={(href) => router.push(href)} />

        {settings ? (
          <>
            <PreferenceSettings settings={settings} onSave={save} />
            <NotificationSettings settings={settings} onSave={save} />
          </>
        ) : (
          <Text size="sm" tone="muted">
            {saver.isLoading
              ? t("settings.loading")
              : saver.errorMessage || t("settings.unavailable")}
          </Text>
        )}

        {saver.errorMessage ? (
          <FeedbackBanner
            tone="error"
            message={saver.errorMessage}
            testID="settings-error"
          />
        ) : null}
        {saver.settingsMessage !== "" ? (
          <FeedbackBanner
            tone="success"
            message={saver.settingsMessage}
            testID="settings-success"
          />
        ) : null}
        {pendingSettings ? (
          <StyledButton
            label={t("settings.retrySaving")}
            onPress={() => void saver.saveSettings(pendingSettings)}
            isLoading={saver.isSavingSettings}
            variant="secondary"
            testID="retry-save-settings"
          />
        ) : null}
        {saver.showLoadRetry ? (
          <StyledButton
            label={t("settings.retryLoading")}
            onPress={() => void saver.loadSettings()}
            variant="secondary"
            testID="retry-load-settings"
          />
        ) : null}

        <LogoutRow {...logout} />
      </Stack>
    </Screen>
  );
}
