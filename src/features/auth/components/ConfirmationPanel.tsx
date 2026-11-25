import { useState } from "react";
import {
  FeedbackBanner,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
import { useAuthStore } from "../../../state/useAuthStore";
import { getErrorMessage } from "../../../utils/errors";
import { BackToLoginLink } from "./BackToLoginLink";

interface ConfirmationPanelProps {
  /** The address the confirmation email went to ("" if unknown). */
  email: string;
  onBackToLogin: () => void;
  testID?: string;
}

/** After signing up: confirm the email first, or resend the confirmation. */
export function ConfirmationPanel({
  email,
  onBackToLogin,
  testID,
}: ConfirmationPanelProps) {
  const resendConfirmation = useAuthStore((state) => state.resendConfirmation);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resend = async () => {
    setFormError("");
    setSuccessMessage("");
    try {
      await resendConfirmation({ email });
      setSuccessMessage("A new confirmation email was sent.");
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Could not resend confirmation. Please retry."),
      );
    }
  };

  return (
    <Stack gap="md" testID={testID}>
      <Text align="center" tone="muted">
        Check {email || "your inbox"} and confirm your email before logging in.
      </Text>
      {successMessage !== "" ? (
        <FeedbackBanner
          tone="success"
          message={successMessage}
          testID="confirmation-success"
        />
      ) : null}
      {formError !== "" ? (
        <FeedbackBanner
          tone="error"
          message={formError}
          testID="confirmation-error"
        />
      ) : null}
      <StyledButton
        label="Resend confirmation"
        onPress={resend}
        isLoading={isLoading}
        testID="resend-confirmation-button"
      />
      <BackToLoginLink onPress={onBackToLogin} />
    </Stack>
  );
}
