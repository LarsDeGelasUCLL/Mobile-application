import { useEffect, useState } from "react";
import { getErrorMessage } from "../../../src/utils/errors";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import { useAuthStore } from "../../../src/state/useAuthStore";
import {
  FeedbackBanner,
  InputField,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
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

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [profile, setProfile] = useState<ProfileFormValues>(emptyProfile);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [partialSuccessWarning, setPartialSuccessWarning] = useState("");
  const [profileError, setProfileError] = useState("");

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
          getErrorMessage(
            saveError,
            "Could not save your profile. Please retry.",
          ),
        );
      }
    }
  };

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label={profileError ? "Retry save" : "Save changes"}
          onPress={handleSaveProfile}
          isLoading={isLoading}
          testID="save-profile-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Edit profile"
          onBack={() => goBackOr("/settings")}
          testID="edit-profile-header"
        />
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
          onChangeText={(value) => updateField("profilePictureUrl", value)}
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
          <FeedbackBanner
            tone="error"
            message={profileError}
            testID="profile-save-error"
          />
        ) : null}
        {savedMessage !== "" ? (
          <FeedbackBanner
            tone="success"
            message={savedMessage}
            testID="profile-saved-message"
          />
        ) : null}
        {partialSuccessWarning !== "" ? (
          <FeedbackBanner
            tone="warning"
            message={partialSuccessWarning}
            testID="profile-save-warning"
          />
        ) : null}
      </Stack>
    </Screen>
  );
}
