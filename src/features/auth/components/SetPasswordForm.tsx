import { useState } from "react";
import {
  FeedbackBanner,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { useAuthStore } from "../../../state/useAuthStore";
import { getErrorMessage } from "../../../utils/errors";
import { validateNewPassword, type NewPasswordErrors } from "../authValidation";
import type { AuthFieldProps } from "../types";
import { BackToLoginLink } from "./BackToLoginLink";
import { NewPasswordFields } from "./NewPasswordFields";

interface SetPasswordFormProps extends AuthFieldProps {
  /** The reset link expired: back to the reset form. */
  onRequestReset: () => void;
  onBackToLogin: () => void;
  testID?: string;
}

/** Chooses a new password after opening the reset email's link. Without the
 * link's session it offers a new reset email instead. */
export function SetPasswordForm({
  fields,
  onChangeField,
  onRequestReset,
  onBackToLogin,
  testID,
}: SetPasswordFormProps) {
  const setPassword = useAuthStore((state) => state.setPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<NewPasswordErrors>({});
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { password } = fields;

  const submit = async () => {
    // Unreachable today (the button only renders when signed in); kept so
    // submit never calls setPassword without the reset link's session.
    if (!isAuthenticated) {
      setFormError(
        "This reset link is no longer active. Request a new reset link and try again.",
      );
      return;
    }
    const nextErrors = validateNewPassword(password, confirmPassword);
    setErrors(nextErrors);
    setFormError("");
    setSuccessMessage("");
    if (nextErrors.passwordError || nextErrors.confirmPasswordError) return;

    try {
      await setPassword({ password });
      setSuccessMessage("Your password was updated.");
      onChangeField("password", "");
      setConfirmPassword("");
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Could not update the password. Please retry."),
      );
    }
  };

  return (
    <Stack gap="lg" testID={testID}>
      <NewPasswordFields
        password={password}
        confirmPassword={confirmPassword}
        onChangePassword={(value) => onChangeField("password", value)}
        onChangeConfirmPassword={setConfirmPassword}
        errors={errors}
        passwordLabel="Password"
        passwordTestID="password-input"
        confirmPasswordTestID="confirm-password-input"
      />
      {formError !== "" ? (
        <FeedbackBanner tone="error" message={formError} testID="auth-error" />
      ) : null}
      {successMessage !== "" ? (
        <FeedbackBanner
          tone="success"
          message={successMessage}
          testID="auth-success"
        />
      ) : null}
      {isAuthenticated ? (
        <StyledButton
          label="Update password"
          onPress={submit}
          isLoading={isLoading}
          testID="set-password-button"
        />
      ) : (
        <>
          <FeedbackBanner
            tone="error"
            message="This reset link is no longer active. Request a new reset email to continue."
            testID="expired-auth-link"
          />
          <StyledButton
            label="Request another reset email"
            onPress={onRequestReset}
            testID="expired-reset-button"
          />
        </>
      )}
      <BackToLoginLink onPress={onBackToLogin} />
    </Stack>
  );
}
