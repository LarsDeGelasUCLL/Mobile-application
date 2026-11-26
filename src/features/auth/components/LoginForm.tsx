import { useState } from "react";
import {
  FeedbackBanner,
  Row,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { errorMessage, useI18n, type TranslationKey } from "../../../i18n";
import { useAuthStore } from "../../../state/useAuthStore";
import { validateEmail, validatePassword } from "../authValidation";
import type { AuthFieldProps } from "../types";
import { AuthEmailField } from "./AuthEmailField";
import { AuthPasswordField } from "./AuthPasswordField";

interface LoginFormProps extends AuthFieldProps {
  onLoggedIn: () => void;
  onForgotPassword: () => void;
  testID?: string;
}

/** Email + password log in, with the "Forgot password?" link. */
export function LoginForm({
  fields,
  onChangeField,
  onLoggedIn,
  onForgotPassword,
  testID,
}: LoginFormProps) {
  const { t } = useI18n();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [emailError, setEmailError] = useState<TranslationKey>();
  const [passwordError, setPasswordError] = useState<TranslationKey>();
  const [formError, setFormError] = useState("");
  const { email, password } = fields;

  const submit = async () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");
    if (nextEmailError || nextPasswordError) return;

    try {
      await login({ email, password });
      onLoggedIn();
    } catch (error) {
      setFormError(errorMessage(error, "errors.fallback.login"));
    }
  };

  return (
    <Stack gap="lg" testID={testID}>
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
      <Row justify="flex-end">
        <StyledButton
          label={t("auth.login.forgotPassword")}
          onPress={onForgotPassword}
          variant="link"
        />
      </Row>
      {formError !== "" ? (
        <FeedbackBanner tone="error" message={formError} testID="auth-error" />
      ) : null}
      <StyledButton
        label={t("auth.login.submit")}
        onPress={submit}
        isLoading={isLoading}
        testID="login-button"
      />
    </Stack>
  );
}
