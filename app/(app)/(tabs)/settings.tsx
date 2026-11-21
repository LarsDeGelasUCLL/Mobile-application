import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../../src/state/useAuthStore";
import { useSettingsStore } from "../../../src/state/useSettingsStore";
import type { UpdateUserSettingsDto } from "../../../src/types";
import {
  Card,
  Checkbox,
  Divider,
  InputField,
  Screen,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { InfoRow } from "../../../src/components/common/InfoRow";
import { SectionHeader } from "../../../src/components/common/SectionHeader";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { colors } from "../../../src/theme/colors";
import { validatePassword } from "../../../src/features/auth/authValidation";

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
  const { settings, isLoading, error, fetchSettings, updateSettings } =
    useSettingsStore();

  useEffect(() => {
    if (user) {
      void fetchSettings(user.id)
        .then(() => setSettingsActionError(""))
        .catch((loadError) =>
          setSettingsActionError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load settings.",
          ),
        );
    }
  }, [fetchSettings, user?.id]);

  const saveSettings = (payload: UpdateUserSettingsDto) => {
    if (user) {
      void updateSettings(user.id, payload)
        .then(() => setSettingsActionError(""))
        .catch((updateError) =>
          setSettingsActionError(
            updateError instanceof Error
              ? updateError.message
              : "Could not save settings.",
          ),
        );
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
            <Text size="xl" weight="bold">
              Settings
            </Text>
            <Text size="sm" color={colors.muted}>
              Your preferences, gathered in one place.
            </Text>
          </Stack>

          <Card>
            <Stack gap="md">
              <SectionHeader
                title="Appearance"
                description="Shape the app around your preferences."
                badgeLabel="Preview"
                testID="settings-appearance-header"
              />
              <Divider spacing="sm" />
              <InfoRow
                label="Dark mode"
                description="A darker palette for low-light use"
                value="Coming soon"
                highlightValue
                testID="setting-row-dark-mode"
              />
              <InfoRow
                label="Accent color"
                description="Current app accent"
                value="Violet"
                highlightValue
                testID="setting-row-accent-color"
              />
              <InfoRow
                label="Text size"
                description="Comfortable reading size"
                value="Standard"
                highlightValue
                testID="setting-row-text-size"
              />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Preferences
              </Text>
              <InfoRow
                label="Currency"
                value="EUR (€)"
                highlightValue
                testID="setting-row-currency"
              />
              <InfoRow
                label="Language"
                value="English"
                highlightValue
                testID="setting-row-language"
              />
              <InfoRow
                label="Week starts on"
                value="Monday"
                highlightValue
                testID="setting-row-week-start"
              />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Notifications
              </Text>
              <Text size="sm" color={colors.muted}>
                Choose which group updates you would like to receive.
              </Text>
              <Divider spacing="sm" />
              {settings ? (
                <>
                  <Checkbox
                    label="New group expenses"
                    checked={settings.notifyNewExpense}
                    onChange={(notifyNewExpense) =>
                      saveSettings({ notifyNewExpense })
                    }
                  />
                  <Checkbox
                    label="Payment reminders"
                    checked={settings.notifyReminders}
                    onChange={(notifyReminders) =>
                      saveSettings({ notifyReminders })
                    }
                  />
                  <Checkbox
                    label="New members and group updates"
                    checked={settings.notifyGroupUpdates}
                    onChange={(notifyGroupUpdates) =>
                      saveSettings({ notifyGroupUpdates })
                    }
                  />
                </>
              ) : (
                <Text size="sm" color={colors.muted}>
                  {isLoading
                    ? "Loading notification settings..."
                    : settingsActionError ||
                      error ||
                      "Settings are unavailable."}
                </Text>
              )}
              {(settingsActionError || error) && settings ? (
                <Text size="sm" color={colors.muted}>
                  {settingsActionError || error}
                </Text>
              ) : null}
              <Text size="sm" color={colors.muted}>
                Payment status notifications are not available in saved settings
                yet.
              </Text>
              {!settings && !isLoading && user ? (
                <StyledButton
                  label="Retry loading settings"
                  onPress={() => {
                    void fetchSettings(user.id)
                      .then(() => setSettingsActionError(""))
                      .catch((loadError) =>
                        setSettingsActionError(
                          loadError instanceof Error
                            ? loadError.message
                            : "Could not load settings.",
                        ),
                      );
                  }}
                  variant="secondary"
                />
              ) : null}
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Privacy & account
              </Text>
              <InfoRow
                label="Profile visibility"
                value="Group members"
                highlightValue
                testID="setting-row-visibility"
              />
              <InfoRow
                label="Download my data"
                value="Coming soon"
                highlightValue
                testID="setting-row-download-data"
              />
              <Divider spacing="sm" />
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
                <View style={styles.errorBanner} testID="change-password-error">
                  <Text size="sm" color={colors.error}>
                    {passwordRequestError}
                  </Text>
                </View>
              ) : null}
              {passwordMessage !== "" ? (
                <View
                  style={styles.successBanner}
                  testID="change-password-success"
                >
                  <Text size="sm" color={colors.success}>
                    {passwordMessage}
                  </Text>
                </View>
              ) : null}
              <StyledButton
                label="Update password"
                onPress={handleSetPassword}
                isLoading={isAuthLoading}
                testID="change-password-button"
              />
              <Divider spacing="sm" />
              {logoutError !== "" ? (
                <View style={styles.errorBanner} testID="settings-logout-error">
                  <Text size="sm" color={colors.error}>
                    {logoutError}
                  </Text>
                </View>
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
  errorBanner: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
    padding: 12,
  },
  successBanner: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
    padding: 12,
  },
});
