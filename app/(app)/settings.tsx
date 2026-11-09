import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Badge,
  Card,
  Checkbox,
  Divider,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
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
            <View style={styles.sectionHeading}>
              <Stack gap="sm">
                <Text size="md" weight="bold">
                  Appearance
                </Text>
                <Text size="sm" color={colors.muted}>
                  Shape the app around your preferences.
                </Text>
              </Stack>
              <Badge label="Preview" />
            </View>
            <Divider spacing="sm" />
            <SettingRow
              label="Dark mode"
              description="A darker palette for low-light use"
              value="Coming soon"
            />
            <SettingRow
              label="Accent color"
              description="Current app accent"
              value="Violet"
            />
            <SettingRow
              label="Text size"
              description="Comfortable reading size"
              value="Standard"
            />
          </Stack>
        </Card>

        <Card>
          <Stack gap="md">
            <Text size="md" weight="bold">
              Preferences
            </Text>
            <SettingRow label="Currency" value="EUR (€)" />
            <SettingRow label="Language" value="English" />
            <SettingRow label="Week starts on" value="Monday" />
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
            <SettingRow label="Profile visibility" value="Group members" />
            <SettingRow label="Download my data" value="Coming soon" />
            <SettingRow label="Change password" value="Coming soon" />
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
    </Screen>
  );
}

function SettingRow({
  label,
  description,
  value,
}: {
  label: string;
  description?: string;
  value: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopy}>
        <Text size="sm" weight="medium">
          {label}
        </Text>
        {description !== undefined && (
          <Text size="sm" color={colors.muted}>
            {description}
          </Text>
        )}
      </View>
      <Text size="sm" color={colors.primaryDark} align="right">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  settingCopy: {
    flex: 1,
    gap: 2,
  },
});
