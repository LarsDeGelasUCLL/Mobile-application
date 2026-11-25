import { useState } from "react";
import { Platform } from "react-native";
import {
  FeedbackBanner,
  InputField,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { useAuthStore } from "../../../state/useAuthStore";
import { getErrorMessage } from "../../../utils/errors";
import { validateEmail } from "../authValidation";
import type { AuthFieldProps } from "../useLoginPage";
import { BackToLoginLink } from "./BackToLoginLink";

interface ResetFormProps extends AuthFieldProps {
  /** Shown until the first submit, e.g. after a failed reset link. */
  initialError?: string;
  onBackToLogin: () => void;
  testID?: string;
}

/** Where the reset email's link opens the app: web origin or the native scheme. */
function setPasswordRedirectUrl() {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/login?mode=set-password`;
  }
  return "laruna://login?mode=set-password";
}

/** Sends the password reset email. */
export function ResetForm({
  fields,
  onChangeField,
  initialError = "",
  onBackToLogin,
  testID,
}: ResetFormProps) {
  const requestPasswordReset = useAuthStore(
    (state) => state.requestPasswordReset,
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState(initialError);
  const [successMessage, setSuccessMessage] = useState("");
  const { email } = fields;

  const submit = async () => {
    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    setFormError("");
    setSuccessMessage("");
    if (nextEmailError) return;

    try {
      await requestPasswordReset({
        email,
        redirectTo: setPasswordRedirectUrl(),
      });
      setSuccessMessage(
        "Reset instructions were sent. Open the email link to choose a new password.",
      );
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          "Could not send reset instructions. Please retry.",
        ),
      );
    }
  };

  return (
    <Stack gap="lg" testID={testID}>
      <InputField
        label="Email"
        value={email}
        onChangeText={(value) => onChangeField("email", value)}
        placeholder="you@example.com"
        keyboardType="email-address"
        error={emailError}
        testID="email-input"
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
      <StyledButton
        label="Send reset instructions"
        onPress={submit}
        isLoading={isLoading}
        testID="password-reset-button"
      />
      <BackToLoginLink onPress={onBackToLogin} />
    </Stack>
  );
}
