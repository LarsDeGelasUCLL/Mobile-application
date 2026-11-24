import { useEffect, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useSettingsStore } from "../../../src/state/useSettingsStore";
import type { UiTheme, UpdateUserSettingsDto } from "../../../src/types";
import {
  Card,
  Checkbox,
  ConfirmDialog,
  Divider,
  FeedbackBanner,
  ListRow,
  Screen,
  ScreenHeader,
  Select,
  Stack,
  Text,
  type SelectOption,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { useTheme } from "../../../src/theme/ThemeProvider";

const themes: SelectOption<UiTheme>[] = [
  { label: "System", value: "SYSTEM" },
  { label: "Light", value: "LIGHT" },
  { label: "Dark", value: "DARK" },
];

const languages: SelectOption<string>[] = [
  { label: "English", value: "en" },
  { label: "Nederlands", value: "nl" },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [settingsActionError, setSettingsActionError] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [pendingSettings, setPendingSettings] =
    useState<UpdateUserSettingsDto | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const { settings, isLoading, error, fetchSettings, updateSettings } =
    useSettingsStore();

  const loadSettings = async () => {
    if (!user) return;
    setSettingsActionError("");
    try {
      await fetchSettings(user.id);
    } catch (loadError) {
      setSettingsActionError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load settings.",
      );
    }
  };

  useEffect(() => {
    if (user) void loadSettings();
  }, [user?.id]);

  const saveSettings = async (payload: UpdateUserSettingsDto) => {
    if (!user || isSavingSettings) return;
    setPendingSettings(payload);
    setSettingsActionError("");
    setSettingsMessage("");
    setIsSavingSettings(true);
    try {
      await updateSettings(user.id, payload);
      setPendingSettings(null);
      setSettingsMessage("Settings saved.");
    } catch (updateError) {
      setSettingsActionError(
        updateError instanceof Error
          ? updateError.message
          : "Could not save settings. Please retry.",
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    setLogoutError("");
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch (logoutError) {
      setConfirmLogout(false);
      setLogoutError(
        logoutError instanceof Error
          ? logoutError.message
          : "Could not log out. Please retry.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sectionLabel = (label: string) => (
    <Text size="sm" weight="bold" color={colors.textMuted}>
      {label}
    </Text>
  );

  return (
    <Screen padding="lg">
      <View testID="settings-screen">
        <Stack gap="lg">
          <ScreenHeader
            title="Settings"
            onBack={() =>
              router.canGoBack() ? router.back() : router.replace("/profile")
            }
            testID="settings-header"
          />

          <Stack gap="sm">
            {sectionLabel("ACCOUNT")}
            <Card flush>
              <ListRow
                icon="person-outline"
                label="Edit profile"
                onPress={() => router.push("/settings/profile")}
                testID="settings-edit-profile"
              />
              <Divider />
              <ListRow
                icon="mail-outline"
                label="Email"
                description={user?.email}
                onPress={() => router.push("/settings/email")}
                testID="settings-email"
              />
              <Divider />
              <ListRow
                icon="lock-closed-outline"
                label="Password"
                onPress={() => router.push("/settings/password")}
                testID="settings-password"
              />
            </Card>
          </Stack>

          {settings ? (
            <>
              <Stack gap="sm">
                {sectionLabel("PREFERENCES")}
                <Card>
                  <Stack gap="md">
                    <Select
                      label="Theme"
                      value={settings.uiTheme}
                      options={themes}
                      onChange={(uiTheme) => void saveSettings({ uiTheme })}
                      testID="settings-theme-select"
                    />
                    <Select
                      label="Language"
                      value={settings.languageCode}
                      options={languages}
                      onChange={(languageCode) =>
                        void saveSettings({ languageCode })
                      }
                      testID="settings-language-select"
                    />
                    <Text size="sm" color={colors.textMuted}>
                      Both are saved to your account. Translations follow in a
                      later update.
                    </Text>
                  </Stack>
                </Card>
              </Stack>

              <Stack gap="sm">
                {sectionLabel("NOTIFICATIONS")}
                <Card>
                  <Checkbox
                    label="New group expenses"
                    checked={settings.notifyNewExpense}
                    onChange={(notifyNewExpense) =>
                      void saveSettings({ notifyNewExpense })
                    }
                  />
                  <Checkbox
                    label="Payment reminders"
                    checked={settings.notifyReminders}
                    onChange={(notifyReminders) =>
                      void saveSettings({ notifyReminders })
                    }
                  />
                  <Checkbox
                    label="New members and group updates"
                    checked={settings.notifyGroupUpdates}
                    onChange={(notifyGroupUpdates) =>
                      void saveSettings({ notifyGroupUpdates })
                    }
                  />
                </Card>
              </Stack>
            </>
          ) : (
            <Text size="sm" color={colors.textMuted}>
              {isLoading
                ? "Loading your saved preferences..."
                : settingsActionError || error || "Settings are unavailable."}
            </Text>
          )}

          {settingsActionError || error ? (
            <FeedbackBanner tone="error" testID="settings-error">
              <Text size="sm" color={colors.error}>
                {settingsActionError || error}
              </Text>
            </FeedbackBanner>
          ) : null}
          {settingsMessage !== "" ? (
            <FeedbackBanner tone="success" testID="settings-success">
              <Text size="sm" color={colors.success}>
                {settingsMessage}
              </Text>
            </FeedbackBanner>
          ) : null}
          {pendingSettings ? (
            <StyledButton
              label="Retry saving"
              onPress={() => void saveSettings(pendingSettings)}
              isLoading={isSavingSettings}
              variant="secondary"
              testID="retry-save-settings"
            />
          ) : null}
          {!pendingSettings &&
          !isLoading &&
          (!settings || settingsActionError || error) ? (
            <StyledButton
              label="Retry loading settings"
              onPress={() => void loadSettings()}
              variant="secondary"
              testID="retry-load-settings"
            />
          ) : null}

          {logoutError !== "" ? (
            <FeedbackBanner tone="error" testID="settings-logout-error">
              <Text size="sm" color={colors.error}>
                {logoutError}
              </Text>
            </FeedbackBanner>
          ) : null}
          <Card flush>
            <ListRow
              icon="log-out-outline"
              label="Log out"
              destructive
              onPress={() => setConfirmLogout(true)}
              testID="settings-logout-button"
            />
          </Card>
        </Stack>
      </View>
      <ConfirmDialog
        visible={confirmLogout}
        title="Log out of Laruna?"
        message="You can log back in with your email and password."
        confirmLabel="Log out"
        onConfirm={() => void handleLogout()}
        onCancel={() => setConfirmLogout(false)}
        isLoading={isLoggingOut}
        testID="logout-dialog"
      />
    </Screen>
  );
}
