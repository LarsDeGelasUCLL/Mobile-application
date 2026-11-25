import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getErrorMessage } from "../src/utils/errors";
import { useAuthStore } from "../src/state/useAuthStore";
import { EmailConfirmationRequiredError } from "../src/services";
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../src/features/auth/authValidation";
import { BrandHeader } from "../src/features/auth/components/BrandHeader";
import {
  Card,
  FeedbackBanner,
  InputField,
  Row,
  Screen,
  Spinner,
  Stack,
  StyledButton,
  Text,
} from "../src/components/primitives";

type AuthMode = "login" | "signup" | "reset" | "set-password" | "confirmation";

export default function LoginScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    authLinkError?: string;
    error?: string;
    error_code?: string;
  }>();
  const hasAuthLinkError = Boolean(
    params.authLinkError || params.error || params.error_code,
  );
  const initialMode: AuthMode = hasAuthLinkError
    ? "reset"
    : params.mode === "set-password"
      ? "set-password"
      : params.mode === "reset"
        ? "reset"
        : params.mode === "signup"
          ? "signup"
          : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [nameError, setNameError] = useState<string>();
  const [formError, setFormError] = useState(
    hasAuthLinkError
      ? "That reset link could not be completed. Request a new reset email and try again."
      : "",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const {
    login,
    register,
    requestPasswordReset,
    setPassword: setPasswordAction,
    resendConfirmation,
    initialize,
    isLoading,
    isAuthenticated,
    isInitialized,
  } = useAuthStore();

  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated &&
      mode !== "set-password" &&
      mode !== "confirmation"
    ) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized, mode]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setEmailError(undefined);
    setPasswordError(undefined);
    setConfirmPasswordError(undefined);
    setNameError(undefined);
    setFormError("");
    setSuccessMessage("");
  };

  const authRedirectUrl = (nextMode: "set-password") => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return `${window.location.origin}/login?mode=${nextMode}`;
    }
    return `laruna://login?mode=${nextMode}`;
  };

  const handleLogin = async () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError("");
    setSuccessMessage("");
    if (nextEmailError || nextPasswordError) return;

    try {
      await login({ email, password });
      router.replace("/");
    } catch (error) {
      setFormError(getErrorMessage(error, "Login failed. Please retry."));
    }
  };

  const handleSignup = async () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    const nextNameError = validateDisplayName(displayName);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setNameError(nextNameError);
    setFormError("");
    setSuccessMessage("");
    if (nextEmailError || nextPasswordError || nextNameError) return;

    try {
      await register({
        email,
        password,
        displayName,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      router.replace("/");
    } catch (error) {
      if (error instanceof EmailConfirmationRequiredError) {
        setConfirmationEmail(error.email);
        setMode("confirmation");
        return;
      }
      setFormError(
        getErrorMessage(error, "Registration failed. Please retry."),
      );
    }
  };

  const handlePasswordReset = async () => {
    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    setFormError("");
    setSuccessMessage("");
    if (nextEmailError) return;

    try {
      await requestPasswordReset({
        email,
        redirectTo: authRedirectUrl("set-password"),
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

  const handleSetPassword = async () => {
    if (!isAuthenticated) {
      setFormError(
        "This reset link is no longer active. Request a new reset link and try again.",
      );
      return;
    }
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError = validatePasswordConfirmation(
      password,
      confirmPassword,
    );
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setFormError("");
    setSuccessMessage("");
    if (nextPasswordError || nextConfirmPasswordError) return;

    try {
      await setPasswordAction({ password });
      setSuccessMessage("Your password was updated.");
      setPasswordValue("");
      setConfirmPassword("");
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Could not update the password. Please retry."),
      );
    }
  };

  const handleResend = async () => {
    setFormError("");
    setSuccessMessage("");
    try {
      await resendConfirmation({ email: confirmationEmail });
      setSuccessMessage("A new confirmation email was sent.");
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Could not resend confirmation. Please retry."),
      );
    }
  };

  if (!isInitialized) {
    return (
      <Screen padding="lg">
        <View style={styles.container} testID="auth-bootstrap">
          <BrandHeader testID="login-brand-header" />
          <Card>
            <Stack gap="md" align="center" padding="md">
              {isLoading ? (
                <>
                  <Spinner size="large" />
                  <Text align="center" tone="muted">
                    Restoring your session...
                  </Text>
                </>
              ) : (
                <>
                  <Text align="center" weight="bold">
                    Could not restore your session
                  </Text>
                  <Text size="sm" align="center" tone="muted">
                    Check your connection and try again.
                  </Text>
                  <StyledButton
                    label="Try again"
                    onPress={() => void initialize()}
                    variant="secondary"
                    testID="auth-bootstrap-retry"
                  />
                </>
              )}
            </Stack>
          </Card>
        </View>
      </Screen>
    );
  }

  const title =
    mode === "signup"
      ? "Create your account"
      : mode === "reset"
        ? "Reset your password"
        : mode === "set-password"
          ? "Choose a new password"
          : mode === "confirmation"
            ? "Confirm your email"
            : "Welcome back";

  return (
    <Screen padding="lg" testID="login-screen">
      <View style={styles.container}>
        <BrandHeader testID="login-brand-header" />
        <Card>
          <Stack gap="lg" padding="md">
            <Text size="xxl" weight="bold" align="center">
              {title}
            </Text>

            {mode === "confirmation" ? (
              <Stack gap="md">
                <Text align="center" tone="muted">
                  Check {confirmationEmail || "your inbox"} and confirm your
                  email before logging in.
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
                  onPress={handleResend}
                  isLoading={isLoading}
                  testID="resend-confirmation-button"
                />
                <StyledButton
                  label="Back to log in"
                  onPress={() => switchMode("login")}
                  variant="link"
                />
              </Stack>
            ) : (
              <>
                {mode === "signup" ? (
                  <InputField
                    label="Display name"
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Your name"
                    error={nameError}
                    testID="display-name-input"
                  />
                ) : null}

                {mode !== "set-password" ? (
                  <InputField
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    error={emailError}
                    testID="email-input"
                  />
                ) : null}

                {mode !== "reset" ? (
                  <InputField
                    label="Password"
                    value={password}
                    onChangeText={setPasswordValue}
                    placeholder="At least 8 characters"
                    secureTextEntry
                    error={passwordError}
                    testID="password-input"
                  />
                ) : null}

                {mode === "login" ? (
                  <Row justify="flex-end">
                    <StyledButton
                      label="Forgot password?"
                      onPress={() => switchMode("reset")}
                      variant="link"
                    />
                  </Row>
                ) : null}

                {mode === "set-password" ? (
                  <InputField
                    label="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat your password"
                    secureTextEntry
                    error={confirmPasswordError}
                    testID="confirm-password-input"
                  />
                ) : null}

                {mode === "signup" ? (
                  <InputField
                    label="Phone number (optional)"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="+32..."
                    testID="phone-input"
                  />
                ) : null}

                {formError !== "" ? (
                  <FeedbackBanner
                    tone="error"
                    message={formError}
                    testID="auth-error"
                  />
                ) : null}

                {successMessage !== "" ? (
                  <FeedbackBanner
                    tone="success"
                    message={successMessage}
                    testID="auth-success"
                  />
                ) : null}

                {mode === "login" ? (
                  <StyledButton
                    label="Log in"
                    onPress={handleLogin}
                    isLoading={isLoading}
                    testID="login-button"
                  />
                ) : mode === "signup" ? (
                  <>
                    <StyledButton
                      label="Create account"
                      onPress={handleSignup}
                      isLoading={isLoading}
                      testID="signup-submit-button"
                    />
                    <StyledButton
                      label="Back to log in"
                      onPress={() => switchMode("login")}
                      variant="link"
                    />
                  </>
                ) : mode === "reset" ? (
                  <>
                    <StyledButton
                      label="Send reset instructions"
                      onPress={handlePasswordReset}
                      isLoading={isLoading}
                      testID="password-reset-button"
                    />
                    <StyledButton
                      label="Back to log in"
                      onPress={() => switchMode("login")}
                      variant="link"
                    />
                  </>
                ) : (
                  <>
                    {!isAuthenticated ? (
                      <FeedbackBanner
                        tone="error"
                        message="This reset link is no longer active. Request a new reset email to continue."
                        testID="expired-auth-link"
                      />
                    ) : null}
                    {isAuthenticated ? (
                      <StyledButton
                        label="Update password"
                        onPress={handleSetPassword}
                        isLoading={isLoading}
                        testID="set-password-button"
                      />
                    ) : (
                      <StyledButton
                        label="Request another reset email"
                        onPress={() => switchMode("reset")}
                        testID="expired-reset-button"
                      />
                    )}
                    <StyledButton
                      label="Back to log in"
                      onPress={() => switchMode("login")}
                      variant="link"
                    />
                  </>
                )}
              </>
            )}
          </Stack>
        </Card>
        {mode === "login" ? (
          <Row justify="center" align="center" gap="none">
            <Text size="sm" tone="muted">
              New to Laruna?
            </Text>
            <StyledButton
              label="Create account"
              onPress={() => switchMode("signup")}
              variant="link"
              testID="signup-button"
            />
          </Row>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
