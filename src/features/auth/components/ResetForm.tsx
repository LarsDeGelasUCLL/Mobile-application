import { useState } from "react";
import {
  FeedbackBanner,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { errorMessage, useI18n, type TranslationKey } from "../../../i18n";
import { useAuthStore } from "../../../state/useAuthStore";
import { authRedirectUrl } from "../authRedirect";
import { validateEmail } from "../authValidation";
import type { AuthFieldProps } from "../types";
import { AuthEmailField } from "./AuthEmailField";
import { BackToLoginLink } from "./BackToLoginLink";

interface ResetFormProps extends AuthFieldProps {
  /** Shown until the first submit, e.g. after a failed reset link. */
  initialError?: string;
  onBackToLogin: () => void;
  testID?: string;
}

/** Sends the password reset email. */
export function ResetForm({
  fields,
  onChangeField,
  initialError = "",
  onBackToLogin,
  testID,
}: ResetFormProps) {
  const { t } = useI18n();
  const requestPasswordReset = useAuthStore(
    (state) => state.requestPasswordReset,
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const [emailError, setEmailError] = useState<TranslationKey>();
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
        redirectTo: authRedirectUrl("login?mode=set-password"),
      });
      setSuccessMessage(t("feedback.resetSent"));
    } catch (error) {
      setFormError(
        errorMessage(error, "errors.fallback.sendReset"),
      );
    }
  };

  return (
    <Stack gap="lg" testID={testID}>
      <AuthEmailField
        value={email}
        onChangeText={(value) => onChangeField("email", value)}
        error={emailError && t(emailError)}
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
        label={t("auth.reset.submit")}
        onPress={submit}
        isLoading={isLoading}
        testID="password-reset-button"
      />
      <BackToLoginLink onPress={onBackToLogin} />
    </Stack>
  );
}
