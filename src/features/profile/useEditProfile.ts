import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ProfileUpdatePartialSuccessError } from "../../services/profiles/profileService";
import { useAuthStore } from "../../state/useAuthStore";
import { getErrorMessage } from "../../utils/errors";
import {
  profileFormValues,
  validateProfile,
  type ProfileFieldErrors,
  type ProfileFormValues,
} from "./profileValidation";

/** The edit-profile page: the stored profile that seeds the form, field
 * errors, the save with its success / partial-success / error messages. */
export function useEditProfile() {
  const { user, updateProfile, isLoading } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      updateProfile: state.updateProfile,
      isLoading: state.isLoading,
    })),
  );
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [savedMessage, setSavedMessage] = useState("");
  const [partialSuccessWarning, setPartialSuccessWarning] = useState("");
  const [profileError, setProfileError] = useState("");
  // Bumped when a save reaches the store, so the form re-seeds with the
  // stored (normalised) values even when they equal the old ones.
  const [savedCount, setSavedCount] = useState(0);

  const initialValues = profileFormValues(user);
  // A new key remounts the form with fresh values, as the old effect on
  // `user` re-seeded them.
  const formKey = [savedCount, user?.id ?? "", ...Object.values(initialValues)]
    .map(String)
    .join("\n");

  const clearMessages = () => {
    setSavedMessage("");
    setPartialSuccessWarning("");
    setProfileError("");
  };

  const changeField = (field: keyof ProfileFormValues) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    clearMessages();
  };

  const save = async (values: ProfileFormValues) => {
    clearMessages();
    const result = validateProfile(values);
    setFieldErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;

    try {
      await updateProfile(result.values);
      setSavedMessage("Your profile was saved.");
      setSavedCount((count) => count + 1);
    } catch (saveError) {
      if (saveError instanceof ProfileUpdatePartialSuccessError) {
        setSavedMessage("Your profile was saved to your account.");
        setPartialSuccessWarning(
          "The database profile updated, but Auth metadata did not. Your displayed name may not refresh until your next sign-in.",
        );
        setSavedCount((count) => count + 1);
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

  return {
    initialValues,
    formKey,
    isLoading,
    fieldErrors,
    savedMessage,
    partialSuccessWarning,
    profileError,
    changeField,
    save,
  };
}
