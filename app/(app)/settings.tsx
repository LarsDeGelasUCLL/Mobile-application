import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import { useSettingsStore } from "../../src/state/useSettingsStore";
import type { UpdateUserSettingsDto } from "../../src/types";
import {
  Card,
  Checkbox,
  Divider,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
import { InfoRow } from "../../src/components/common/InfoRow";
import { SectionHeader } from "../../src/components/common/SectionHeader";
import { StyledButton } from "../../src/components/common/StyledButton";
import { colors } from "../../src/theme/colors";

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { settings, isLoading, error, fetchSettings, updateSettings } =
    useSettingsStore();

  useEffect(() => {
    if (user) {
      void fetchSettings(user.id).catch((loadError) =>
        console.error("Could not load settings.", loadError),
      );
    }
  }, [fetchSettings, user?.id]);

  const saveSettings = (payload: UpdateUserSettingsDto) => {
    if (user) {
      void updateSettings(user.id, payload).catch((updateError) =>
        console.error("Could not save settings.", updateError),
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
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
                    : (error ?? "Settings are unavailable.")}
                </Text>
              )}
              {error && settings ? (
                <Text size="sm" color={colors.muted}>
                  {error}
                </Text>
              ) : null}
              <Text size="sm" color={colors.muted}>
                Payment status notifications are not available in saved settings
                yet.
              </Text>
              {!settings && !isLoading && user ? (
                <StyledButton
                  label="Retry loading settings"
                  onPress={() =>
                    void fetchSettings(user.id).catch((loadError) =>
                      console.error("Could not load settings.", loadError),
                    )
                  }
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
              <InfoRow
                label="Change password"
                value="Coming soon"
                highlightValue
                testID="setting-row-change-password"
              />
              <Divider spacing="sm" />
              <StyledButton
                label="Log out"
                onPress={handleLogout}
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
