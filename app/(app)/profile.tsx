import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Screen,
  Stack,
  Text,
  InputField,
  Badge,
  Card,
  Avatar,
} from "../../src/components/primitives";
import { StyledButton } from "../../src/components/StyledButton";

export default function ProfileScreen() {
  const { user, logout, updateName, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [iban, setIban] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  const handleSaveProfile = async () => {
    setError("");
    setSavedMessage("");

    if (!name.trim()) {
      setError("Vul een geldige weergavenaam in.");
      return;
    }

    try {
      await updateName(name);
      setSavedMessage("Profiel succesvol bijgewerkt!");
    } catch {
      setError("Kon profiel niet opslaan. Probeer het opnieuw.");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <Screen padding="lg">
      <View style={styles.container}>
        <Stack gap="lg">
          <Card>
            <Stack gap="sm" align="center">
              <Avatar name={user?.name ?? user?.email ?? "U"} size="lg" />
              <Text size="lg" weight="bold">
                {user?.name ?? "Gebruiker"}
              </Text>
              <Text size="sm">{user?.email ?? ""}</Text>
              <Badge label="Actief lid" variant="success" />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Persoonlijke instellingen
              </Text>

              <InputField
                label="Weergavenaam in groepen"
                value={name}
                onChangeText={setName}
                placeholder="Jouw naam"
                error={error !== "" ? error : undefined}
                testID="profile-name-input"
              />

              <InputField
                label="IBAN-rekeningnummer (voor terugbetalingen)"
                value={iban}
                onChangeText={setIban}
                placeholder="BE00 0000 0000 0000"
                testID="profile-iban-input"
              />

              {savedMessage !== "" && <Text size="sm">{savedMessage}</Text>}

              <StyledButton
                label="Wijzigingen opslaan"
                onPress={handleSaveProfile}
                isLoading={isLoading}
                testID="save-profile-button"
              />
            </Stack>
          </Card>

          <StyledButton
            label="Uitloggen"
            onPress={handleLogout}
            variant="secondary"
            testID="logout-button"
          />
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
