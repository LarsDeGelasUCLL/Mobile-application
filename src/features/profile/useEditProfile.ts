import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ProfileUpdatePartialSuccessError } from "../../services/profiles/profileService";
import { useAuthStore } from "../../state/useAuthStore";
import { errorMessage, t } from "../../i18n";
import {
  profileFormKey,
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
  // A new key remounts the form, which re-reads its initial values.
  const formKey = profileFormKey(savedCount, user?.id ?? "", initialValues);

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
      setSavedMessage(t("feedback.profileSaved"));
      setSavedCount((count) => count + 1);
    } catch (saveError) {
      if (saveError instanceof ProfileUpdatePartialSuccessError) {
        setSavedMessage(t("feedback.profileSavedToAccount"));
        setPartialSuccessWarning(t("feedback.profilePartialSuccess"));
        setSavedCount((count) => count + 1);
      } else {
        setProfileError(
          errorMessage(saveError, "errors.fallback.saveProfile"),
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
