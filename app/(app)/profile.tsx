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
  Divider,
} from "../../src/components/primitives";
import { StyledButton } from "../../src/components/StyledButton";
import { colors } from "../../src/types/theme";

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
          <Stack gap="sm">
            <Text size="sm" weight="bold" color={colors.primary}>
              YOUR ACCOUNT
            </Text>
            <Text size="xl" weight="bold">
              Profile
            </Text>
            <Text size="sm" color={colors.muted}>
              Your details for the people you share with.
            </Text>
          </Stack>

          <Card>
            <Stack gap="sm" align="center">
              <Avatar name={user?.name ?? user?.email ?? "U"} size="lg" />
              <Text size="lg" weight="bold">
                {user?.name ?? "Gebruiker"}
              </Text>
              <Text size="sm">{user?.email ?? ""}</Text>
              <Badge label="Account active" variant="success" />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Personal details
              </Text>
              <Text size="sm" color={colors.muted}>
                Update the name your group members will see.
              </Text>

              <InputField
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                error={error !== "" ? error : undefined}
                testID="profile-name-input"
              />

              <InputField
                label="IBAN for reimbursements"
                value={iban}
                onChangeText={setIban}
                placeholder="BE00 0000 0000 0000"
                testID="profile-iban-input"
              />

              <Text size="sm" color={colors.muted}>
                IBAN is a local placeholder and is not saved yet.
              </Text>

              {savedMessage !== "" && (
                <Text size="sm" color={colors.success}>
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
          </Card>

          <Card>
            <Stack gap="md">
              <View style={styles.sectionHeading}>
                <Stack gap="sm">
                  <Text size="md" weight="bold">
                    More about you
                  </Text>
                  <Text size="sm" color={colors.muted}>
                    Optional details to add when profile settings are connected.
                  </Text>
                  <Badge label="Coming soon" />
                </Stack>
              </View>
              <Divider spacing="sm" />
              <ProfileDetail label="Phone number" value="Not added" />
              <ProfileDetail label="Preferred currency" value="EUR (€)" />
              <ProfileDetail label="Language" value="English" />
              <ProfileDetail label="Payment method" value="Not connected" />
            </Stack>
          </Card>

          <StyledButton
            label="Log out"
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
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  detailValue: {
    flex: 1,
    flexShrink: 1,
    alignItems: "flex-end",
  },
});

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text size="sm" color={colors.muted}>
        {label}
      </Text>
      <View style={styles.detailValue}>
        <Text size="sm" weight="medium" color={colors.text} align="right">
          {value}
        </Text>
      </View>
    </View>
  );
}
