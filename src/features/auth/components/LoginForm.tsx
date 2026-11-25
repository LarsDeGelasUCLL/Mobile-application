import { useState } from "react";
import {
  FeedbackBanner,
  Row,
  Stack,
  StyledButton,
} from "../../../components/primitives";
import { useAuthStore } from "../../../state/useAuthStore";
import { getErrorMessage } from "../../../utils/errors";
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
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
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
      setFormError(getErrorMessage(error, "Login failed. Please retry."));
    }
  };

  return (
    <Stack gap="lg" testID={testID}>
      <AuthEmailField
        value={email}
        onChangeText={(value) => onChangeField("email", value)}
        error={emailError}
      />
      <AuthPasswordField
        value={password}
        onChangeText={(value) => onChangeField("password", value)}
        error={passwordError}
      />
      <Row justify="flex-end">
        <StyledButton
          label="Forgot password?"
          onPress={onForgotPassword}
          variant="link"
        />
      </Row>
      {formError !== "" ? (
        <FeedbackBanner tone="error" message={formError} testID="auth-error" />
      ) : null}
      <StyledButton
        label="Log in"
        onPress={submit}
        isLoading={isLoading}
        testID="login-button"
      />
    </Stack>
  );
}
