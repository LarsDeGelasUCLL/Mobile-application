import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Screen,
  Stack,
  Text,
  Badge,
  InputField,
} from "../../src/components/primitives";
import { StyledButton } from "@/components/StyledButton";

export default function ProfileScreen() {
  const { user, logout, updateName, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [iban, setIban] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");

  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

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
      <Stack gap="lg">
        {/* Bovenste kaart: Avatar & Accountstatus */}
        <View style={styles.card}>
          <Stack gap="sm" align="center">
            <View style={styles.avatar}>
              <Text size="xl" weight="bold" color="#FFFFFF">
                {initial}
              </Text>
            </View>
            <Text size="lg" weight="bold">
              {user?.name ?? "Gebruiker"}
            </Text>
            <Text size="sm" color="#6B7280">
              {user?.email ?? ""}
            </Text>
            <Badge label="Actief lid" variant="success" />
          </Stack>
        </View>

        {/* Formulier: Gegevens & Betaalvoorkeur voor de kostentracker */}
        <View style={styles.card}>
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

            {savedMessage !== "" && (
              <Text size="sm" color="#16A34A">
                {savedMessage}
              </Text>
            )}

            <StyledButton
              label="Wijzigingen opslaan"
              onPress={handleSaveProfile}
              isLoading={isLoading}
              testID="save-profile-button"
            />
          </Stack>
        </View>

        {/* Acties: Terug & Uitloggen */}
        <Stack gap="sm">
          <StyledButton
            label="Terug naar overzicht"
            onPress={() => router.back()}
            variant="secondary"
            testID="back-home-button"
          />
          <StyledButton
            label="Uitloggen"
            onPress={handleLogout}
            variant="secondary"
            testID="logout-button"
          />
        </Stack>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
});
