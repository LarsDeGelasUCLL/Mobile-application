import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useSettingsStore } from "../../../src/state/useSettingsStore";
import type { UiTheme, UpdateUserSettingsDto } from "../../../src/types";
import {
  Card,
  Checkbox,
  Divider,
  FeedbackBanner,
  InputField,
  Radio,
  Screen,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { colors } from "../../../src/theme/colors";
import { validatePassword } from "../../../src/features/auth/authValidation";

const themes: { label: string; value: UiTheme }[] = [
  { label: "System", value: "SYSTEM" },
  { label: "Light", value: "LIGHT" },
  { label: "Dark", value: "DARK" },
];

const languages = [
  { label: "English", value: "en" },
  { label: "Nederlands", value: "nl" },
];

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setPassword = useAuthStore((state) => state.setPassword);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordRequestError, setPasswordRequestError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleSetPassword = async () => {
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError =
      confirmPassword === password ? undefined : "Passwords must match.";
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setPasswordMessage("");
    setPasswordRequestError("");
    if (nextPasswordError || nextConfirmPasswordError) return;

    try {
      await setPassword({ password });
      setPasswordValue("");
      setConfirmPassword("");
      setPasswordMessage("Your password was updated.");
    } catch (passwordError) {
      setPasswordRequestError(
        passwordError instanceof Error
          ? passwordError.message
          : "Could not update the password. Please retry.",
      );
    }
  };

  const handleLogout = async () => {
    setLogoutError("");
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } catch (logoutError) {
      setLogoutError(
        logoutError instanceof Error
          ? logoutError.message
          : "Could not log out. Please retry.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Screen padding="lg">
      <View style={styles.container} testID="settings-screen">
        <Stack gap="lg">
          <Stack gap="sm">
            <Text size="sm" weight="bold" color={colors.primary}>
              MAKE IT YOURS
            </Text>
            <Text size="xxl" weight="bold">
              Settings
            </Text>
            <Text size="sm" color={colors.muted}>
              Your preferences, gathered in one place.
            </Text>
          </Stack>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Preferences
              </Text>
              {settings ? (
                <>
                  <Text size="sm" weight="medium">
                    Theme
                  </Text>
                  {themes.map((theme) => (
                    <Radio
                      key={theme.value}
                      label={theme.label}
                      value={theme.value}
                      selected={settings.uiTheme === theme.value}
                      onSelect={(value) => {
                        const selected = themes.find(
                          (option) => option.value === value,
                        );
                        if (selected) {
                          void saveSettings({ uiTheme: selected.value });
                        }
                      }}
                    />
                  ))}
                  <Text size="sm" color={colors.muted}>
                    The selected theme is saved to your account. App-wide colors
                    are not switched yet.
                  </Text>
                  <Divider spacing="sm" />
                  <Text size="sm" weight="medium">
                    Language
                  </Text>
                  {languages.map((language) => (
                    <Radio
                      key={language.value}
                      label={language.label}
                      value={language.value}
                      selected={settings.languageCode === language.value}
                      onSelect={(value) =>
                        void saveSettings({ languageCode: value })
                      }
                    />
                  ))}
                  <Text size="sm" color={colors.muted}>
                    This preference is saved; translated interface text is not
                    available yet.
                  </Text>
                  <Divider spacing="sm" />
                  <Text size="sm" weight="medium">
                    Notifications
                  </Text>
                  <Text size="sm" color={colors.muted}>
                    Choose which group updates you would like to receive.
                  </Text>
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
                </>
              ) : (
                <Text size="sm" color={colors.muted}>
                  {isLoading
                    ? "Loading your saved preferences..."
                    : settingsActionError ||
                      error ||
                      "Settings are unavailable."}
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
              <Text size="sm" color={colors.muted}>
                Device push-token setup and payment-status alerts are not
                available as editable settings here.
              </Text>
              <Text size="sm" color={colors.muted}>
                Currency, week-start, profile visibility, and data export are
                not represented by the current settings DTO.
              </Text>
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Change password
              </Text>
              <InputField
                label="New password"
                value={password}
                onChangeText={setPasswordValue}
                placeholder="At least 8 characters"
                secureTextEntry
                error={passwordError}
                testID="settings-new-password-input"
              />
              <InputField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                secureTextEntry
                error={confirmPasswordError}
                testID="settings-confirm-password-input"
              />
              {passwordRequestError !== "" ? (
                <FeedbackBanner tone="error" testID="change-password-error">
                  <Text size="sm" color={colors.error}>
                    {passwordRequestError}
                  </Text>
                </FeedbackBanner>
              ) : null}
              {passwordMessage !== "" ? (
                <FeedbackBanner tone="success" testID="change-password-success">
                  <Text size="sm" color={colors.success}>
                    {passwordMessage}
                  </Text>
                </FeedbackBanner>
              ) : null}
              <StyledButton
                label="Update password"
                onPress={handleSetPassword}
                isLoading={isAuthLoading}
                testID="change-password-button"
              />
              <Divider spacing="sm" />
              {logoutError !== "" ? (
                <FeedbackBanner tone="error" testID="settings-logout-error">
                  <Text size="sm" color={colors.error}>
                    {logoutError}
                  </Text>
                </FeedbackBanner>
              ) : null}
              <StyledButton
                label="Log out"
                onPress={handleLogout}
                isLoading={isLoggingOut}
                variant="secondary"
                testID="settings-logout-button"
              />
            </Stack>
          </Card>
        </Stack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
