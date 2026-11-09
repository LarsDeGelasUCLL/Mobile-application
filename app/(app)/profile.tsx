import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/state/useAuthStore";
import {
  Avatar,
  Badge,
  Card,
  Divider,
  InputField,
  Screen,
  Stack,
  Text,
} from "../../src/components/primitives";
import { InfoRow } from "../../src/components/common/InfoRow";
import { SectionHeader } from "../../src/components/common/SectionHeader";
import { StyledButton } from "../../src/components/common/StyledButton";
import { colors } from "../../src/theme/colors";

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
      <View style={styles.container} testID="profile-screen">
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
                <View testID="profile-saved-message">
                  <Text size="sm" color={colors.success}>
                    {savedMessage}
                  </Text>
                </View>
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
              <SectionHeader
                title="More about you"
                description="Optional details to add when profile settings are connected."
                badgeLabel="Coming soon"
                testID="profile-more-header"
              />
              <Divider spacing="sm" />
              <InfoRow
                label="Phone number"
                value="Not added"
                testID="profile-detail-phone"
              />
              <InfoRow
                label="Preferred currency"
                value="EUR (€)"
                testID="profile-detail-currency"
              />
              <InfoRow
                label="Language"
                value="English"
                testID="profile-detail-language"
              />
              <InfoRow
                label="Payment method"
                value="Not connected"
                testID="profile-detail-payment"
              />
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
});
