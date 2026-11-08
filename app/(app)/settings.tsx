import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import { Screen } from "../../src/components/primitives/Screen";
import { Stack } from "../../src/components/primitives/Stack";
import { Text } from "../../src/components/primitives/Text";
import { Card } from "../../src/components/primitives/Card";
import { Checkbox } from "../../src/components/primitives/Checkbox";
import { Divider } from "../../src/components/primitives/Divider";
import { StyledButton } from "../../src/components/StyledButton";

export default function SettingsScreen() {
  const { logout } = useAuthStore();

  const [notifyNewExpense, setNotifyNewExpense] = useState(true);
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyGroupUpdates, setNotifyGroupUpdates] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <Screen padding="lg">
      <Stack gap="lg">
        <Text size="xl" weight="bold">
          Instellingen
        </Text>

        <Card>
          <Stack gap="md">
            <Text size="md" weight="bold">
              Pushmeldingen
            </Text>
            <Text size="sm" color="#6B7280">
              Kies waarvoor je een melding op je telefoon wilt ontvangen.
            </Text>
            <Divider spacing="sm" />
            <Checkbox
              label="Nieuwe uitgaven in mijn groepen"
              checked={notifyNewExpense}
              onChange={setNotifyNewExpense}
            />
            <Checkbox
              label="Betalingsherinneringen"
              checked={notifyReminders}
              onChange={setNotifyReminders}
            />
            <Checkbox
              label="Nieuwe groepsleden & updates"
              checked={notifyGroupUpdates}
              onChange={setNotifyGroupUpdates}
            />
          </Stack>
        </Card>

        <Card>
          <Stack gap="md">
            <Text size="md" weight="bold">
              Account & Sessie
            </Text>
            <StyledButton
              label="Uitloggen"
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
