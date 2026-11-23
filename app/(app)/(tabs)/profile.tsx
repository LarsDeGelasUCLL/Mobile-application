import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../../src/state/useAuthStore";
import {
  Avatar,
  Badge,
  Card,
  FeedbackBanner,
  InputField,
  Screen,
  Stack,
  Text,
} from "../../../src/components/primitives";
import { StyledButton } from "../../../src/components/common/StyledButton";
import { colors } from "../../../src/theme/colors";
import { validateEmail } from "../../../src/features/auth/authValidation";
import {
  validateProfile,
  type ProfileFieldErrors,
  type ProfileFormValues,
} from "../../../src/features/profile/profileValidation";
import { ProfileUpdatePartialSuccessError } from "../../../src/services/profiles/profileService";

const emptyProfile: ProfileFormValues = {
  displayName: "",
  phoneNumber: "",
  iban: "",
  profilePictureUrl: "",
  customBio: "",
};

export default function ProfileScreen() {
  const { user, logout, updateProfile, changeEmail, isLoading } =
    useAuthStore();
  const [profile, setProfile] = useState<ProfileFormValues>(emptyProfile);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [partialSuccessWarning, setPartialSuccessWarning] = useState("");
  const [profileError, setProfileError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [emailMessage, setEmailMessage] = useState("");
  const [emailRequestError, setEmailRequestError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: user.displayName,
        phoneNumber: user.phoneNumber ?? "",
        iban: user.iban ?? "",
        profilePictureUrl: user.profilePictureUrl ?? "",
        customBio: user.customBio ?? "",
      });
    }
  }, [user]);

  const updateField = (field: keyof ProfileFormValues, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setSavedMessage("");
    setPartialSuccessWarning("");
    setProfileError("");
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    setSavedMessage("");
    setPartialSuccessWarning("");
    const result = validateProfile(profile);
    setFieldErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    try {
      await updateProfile(result.values);
      setSavedMessage("Your profile was saved.");
    } catch (saveError) {
      if (saveError instanceof ProfileUpdatePartialSuccessError) {
        setSavedMessage("Your profile was saved to your account.");
        setPartialSuccessWarning(
          "The database profile updated, but Auth metadata did not. Your displayed name may not refresh until your next sign-in.",
        );
      } else {
        setProfileError(
          saveError instanceof Error
            ? saveError.message
            : "Could not save your profile. Please retry.",
        );
      }
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
            <Text size="xxl" weight="bold">
              Profile
            </Text>
            <Text size="sm" color={colors.muted}>
              Your details for the people you share with.
            </Text>
          </Stack>

          <Card>
            <Stack gap="sm" align="center">
              <Avatar
                name={user?.displayName ?? user?.emailAddress ?? "U"}
                uri={user?.profilePictureUrl ?? undefined}
                size="lg"
              />
              <Text size="lg" weight="bold">
                {user?.displayName ?? "User"}
              </Text>
              <Text size="sm">{user?.emailAddress ?? ""}</Text>
              <Badge label="Account active" variant="success" />
            </Stack>
          </Card>

          <Card>
            <Stack gap="md">
              <Text size="md" weight="bold">
                Personal details
              </Text>
              <InputField
                label="Display name"
                value={profile.displayName}
                onChangeText={(value) => updateField("displayName", value)}
                placeholder="Your name"
                error={fieldErrors.displayName}
                editable={!isLoading}
                testID="profile-name-input"
              />
              <InputField
                label="Phone number"
                value={profile.phoneNumber}
                onChangeText={(value) => updateField("phoneNumber", value)}
                placeholder="+32 123 456 789"
                keyboardType="phone-pad"
                error={fieldErrors.phoneNumber}
                editable={!isLoading}
                testID="profile-phone-input"
              />
              <InputField
                label="IBAN for reimbursements"
                value={profile.iban}
                onChangeText={(value) => updateField("iban", value)}
                placeholder="BE00 0000 0000 0000"
                autoCapitalize="characters"
                error={fieldErrors.iban}
                editable={!isLoading}
                testID="profile-iban-input"
              />
              <InputField
                label="Profile picture URL"
                value={profile.profilePictureUrl}
                onChangeText={(value) =>
                  updateField("profilePictureUrl", value)
                }
                placeholder="https://example.com/photo.jpg"
                keyboardType="url"
                autoCapitalize="none"
                error={fieldErrors.profilePictureUrl}
                editable={!isLoading}
                testID="profile-picture-input"
              />
              <InputField
                label="Bio"
                value={profile.customBio}
                onChangeText={(value) => updateField("customBio", value)}
                placeholder="A short introduction"
                multiline
                maxLength={500}
                error={fieldErrors.customBio}
                editable={!isLoading}
                testID="profile-bio-input"
              />
              {profileError !== "" ? (
                <FeedbackBanner tone="error" testID="profile-save-error">
                  <Text size="sm" color={colors.error}>
                    {profileError}
                  </Text>
                </FeedbackBanner>
              ) : null}
              {savedMessage !== "" ? (
                <FeedbackBanner tone="success" testID="profile-saved-message">
                  <Text size="sm" color={colors.success}>
                    {savedMessage}
                  </Text>
                </FeedbackBanner>
              ) : null}
              {partialSuccessWarning !== "" ? (
                <FeedbackBanner tone="warning" testID="profile-save-warning">
                  <Text size="sm" color={colors.warning}>
                    {partialSuccessWarning}
                  </Text>
                </FeedbackBanner>
              ) : null}
              <StyledButton
                label={profileError ? "Retry save" : "Save changes"}
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
                <FeedbackBanner tone="error" testID="change-email-error">
                  <Text size="sm" color={colors.error}>
                    {emailRequestError}
                  </Text>
                </FeedbackBanner>
              ) : null}
              {emailMessage !== "" ? (
                <FeedbackBanner tone="success" testID="change-email-success">
                  <Text size="sm" color={colors.success}>
                    {emailMessage}
                  </Text>
                </FeedbackBanner>
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

          {logoutError !== "" ? (
            <FeedbackBanner tone="error" testID="logout-error">
              <Text size="sm" color={colors.error}>
                {logoutError}
              </Text>
            </FeedbackBanner>
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
});
