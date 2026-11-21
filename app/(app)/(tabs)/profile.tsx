import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../../src/state/useAuthStore";
import {
  Avatar,
  Badge,
  Card,
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
import { validateEmail } from "../../../src/features/auth/authValidation";

export default function ProfileScreen() {
  const { user, logout, updateName, changeEmail, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [iban, setIban] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [error, setError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [emailMessage, setEmailMessage] = useState("");
  const [emailRequestError, setEmailRequestError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSaveProfile = async () => {
    setError("");
    setSavedMessage("");

    if (!name.trim()) {
      setError("Please enter a valid display name.");
      return;
    }

    try {
      await updateName(name);
      setSavedMessage("Profile updated successfully!");
    } catch {
      setError("Could not save your profile. Please try again.");
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

  const handleChangeEmail = async () => {
    const nextEmailError = validateEmail(newEmail);
    setEmailError(nextEmailError);
    setEmailMessage("");
    setEmailRequestError("");
    if (nextEmailError) return;

    try {
      await changeEmail({ email: newEmail });
      setEmailMessage(
        "Confirmation was sent. Check both email addresses to finish the change.",
      );
      setNewEmail("");
    } catch (emailError) {
      setEmailRequestError(
        emailError instanceof Error
          ? emailError.message
          : "Could not request the email change. Please retry.",
      );
    }
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
                {user?.name ?? "User"}
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
                label="Save changes"
                onPress={handleSaveProfile}
                isLoading={isLoading}
                testID="save-profile-button"
              />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Email address
              </Text>
              <Text size="sm" color={colors.muted}>
                Current email: {user?.email ?? "Not available"}
              </Text>
              <InputField
                label="New email"
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="new@example.com"
                keyboardType="email-address"
                error={emailError}
                testID="profile-new-email-input"
              />
              {emailRequestError !== "" ? (
                <View style={styles.errorBanner} testID="change-email-error">
                  <Text size="sm" color={colors.error}>
                    {emailRequestError}
                  </Text>
                </View>
              ) : null}
              {emailMessage !== "" ? (
                <View
                  style={styles.successBanner}
                  testID="change-email-success"
                >
                  <Text size="sm" color={colors.success}>
                    {emailMessage}
                  </Text>
                </View>
              ) : null}
              <StyledButton
                label="Request email change"
                onPress={handleChangeEmail}
                isLoading={isLoading}
                variant="secondary"
                testID="change-email-button"
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

          {logoutError !== "" ? (
            <View style={styles.errorBanner} testID="logout-error">
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
