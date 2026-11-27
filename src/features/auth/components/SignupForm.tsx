import { useState } from "react";
import {
  FeedbackBanner,
  InputField,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { EmailConfirmationRequiredError } from "../../../services";
import { errorMessage, useI18n, type TranslationKey } from "../../../i18n";
import { useAuthStore } from "../../../state/useAuthStore";
import { authRedirectUrl } from "../authRedirect";
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "../authValidation";
import type { AuthFieldProps } from "../types";
import { AuthEmailField } from "./AuthEmailField";
import { AuthPasswordField } from "./AuthPasswordField";
import { BackToLoginLink } from "./BackToLoginLink";

interface SignupFormProps extends AuthFieldProps {
  onSignedUp: () => void;
  /** The account exists but its email must be confirmed first. */
  onConfirmationRequired: (email: string) => void;
  onBackToLogin: () => void;
  testID?: string;
}

/** Create an account: name, email, password and an optional phone number. */
export function SignupForm({
  fields,
  onChangeField,
  onSignedUp,
  onConfirmationRequired,
  onBackToLogin,
  testID,
}: SignupFormProps) {
  const { t, language } = useI18n();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [nameError, setNameError] = useState<TranslationKey>();
  const [emailError, setEmailError] = useState<TranslationKey>();
  const [passwordError, setPasswordError] = useState<TranslationKey>();
  const [formError, setFormError] = useState("");
  const { email, password, displayName, phoneNumber } = fields;

  const submit = async () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    const nextNameError = validateDisplayName(displayName);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setNameError(nextNameError);
    setFormError("");
    if (nextEmailError || nextPasswordError || nextNameError) return;

    try {
      await register({
        email,
        password,
        displayName,
        phoneNumber: phoneNumber.trim() || undefined,
        language,
        redirectTo: authRedirectUrl("login"),
      });
      onSignedUp();
    } catch (error) {
      if (error instanceof EmailConfirmationRequiredError) {
        onConfirmationRequired(error.email);
        return;
      }
      setFormError(
        errorMessage(error, "errors.fallback.register"),
      );
    }
  };

  return (
    <Stack gap="lg" testID={testID}>
      <InputField
        label={t("auth.field.displayName")}
        value={displayName}
        onChangeText={(value) => onChangeField("displayName", value)}
        placeholder={t("auth.field.displayNamePlaceholder")}
        error={nameError && t(nameError)}
        testID="display-name-input"
      />
      <AuthEmailField
        value={email}
        onChangeText={(value) => onChangeField("email", value)}
        error={emailError && t(emailError)}
      />
      <AuthPasswordField
        value={password}
        onChangeText={(value) => onChangeField("password", value)}
        error={passwordError && t(passwordError)}
      />
      <InputField
        label={t("auth.field.phoneOptional")}
        value={phoneNumber}
        onChangeText={(value) => onChangeField("phoneNumber", value)}
        placeholder="+32..."
        testID="phone-input"
      />
      {formError !== "" ? (
        <FeedbackBanner tone="error" message={formError} testID="auth-error" />
      ) : null}
      <StyledButton
        label={t("auth.signup.submit")}
        onPress={submit}
        isLoading={isLoading}
        testID="signup-submit-button"
      />
      <BackToLoginLink onPress={onBackToLogin} />
    </Stack>
  );
}
