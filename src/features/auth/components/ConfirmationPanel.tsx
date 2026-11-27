import { useState } from "react";
import {
  FeedbackBanner,
  Stack,
  StyledButton,
  Text,
} from "../../../components/primitives";
import { useAuthStore } from "../../../state/useAuthStore";
import { errorMessage, useI18n } from "../../../i18n";
import { authRedirectUrl } from "../authRedirect";
import { BackToLoginLink } from "./BackToLoginLink";

interface ConfirmationPanelProps {
  /** The address the confirmation email went to ("" if unknown). */
  email: string;
  onBackToLogin: () => void;
  testID?: string;
}

/** After signup or an unconfirmed login: confirm the email first, or resend the confirmation. */
export function ConfirmationPanel({
  email,
  onBackToLogin,
  testID,
}: ConfirmationPanelProps) {
  const { t } = useI18n();
  const resendConfirmation = useAuthStore((state) => state.resendConfirmation);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resend = async () => {
    setFormError("");
    setSuccessMessage("");
    try {
      await resendConfirmation({ email, redirectTo: authRedirectUrl("login") });
      setSuccessMessage(t("feedback.confirmationResent"));
    } catch (error) {
      setFormError(
        errorMessage(error, "errors.fallback.resendConfirmation"),
      );
    }
  };

  return (
    <Stack gap="md" testID={testID}>
      <Text align="center" tone="muted">
        {email
          ? t("auth.confirmation.checkEmail", { email })
          : t("auth.confirmation.checkInbox")}
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
        label={t("auth.confirmation.resend")}
        onPress={resend}
        isLoading={isLoading}
        testID="resend-confirmation-button"
      />
      <BackToLoginLink onPress={onBackToLogin} />
    </Stack>
  );
}
