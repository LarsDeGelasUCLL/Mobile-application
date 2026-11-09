import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Card,
  Checkbox,
  Divider,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
import { InfoRow } from "../../src/components/InfoRow";
import { SectionHeader } from "../../src/components/SectionHeader";
import { StyledButton } from "../../src/components/StyledButton";
import { colors } from "../../src/types/theme";

export default function SettingsScreen() {
  const { logout } = useAuthStore();

  const [notifyNewExpense, setNotifyNewExpense] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyGroupUpdates, setNotifyGroupUpdates] = useState(false);
  const [notifyPaymentUpdates, setNotifyPaymentUpdates] = useState(true);

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
              <Checkbox
                label="New group expenses"
                checked={notifyNewExpense}
                onChange={setNotifyNewExpense}
              />
              <Checkbox
                label="Payment reminders"
                checked={notifyReminders}
                onChange={setNotifyReminders}
              />
              <Checkbox
                label="New members and group updates"
                checked={notifyGroupUpdates}
                onChange={setNotifyGroupUpdates}
              />
              <Checkbox
                label="Payment status changes"
                checked={notifyPaymentUpdates}
                onChange={setNotifyPaymentUpdates}
              />
              <Text size="sm" color={colors.muted}>
                Notification choices are preview-only and are not saved yet.
              </Text>
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
