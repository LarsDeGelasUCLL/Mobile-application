import { Row, Stack, StyledButton, Text } from "../src/components/primitives";
import { AuthScreen } from "../src/features/auth/components/AuthScreen";
import { ConfirmationPanel } from "../src/features/auth/components/ConfirmationPanel";
import { LoginForm } from "../src/features/auth/components/LoginForm";
import { ResetForm } from "../src/features/auth/components/ResetForm";
import { SessionRestore } from "../src/features/auth/components/SessionRestore";
import { SetPasswordForm } from "../src/features/auth/components/SetPasswordForm";
import { SignupForm } from "../src/features/auth/components/SignupForm";
import { useLoginPage } from "../src/features/auth/useLoginPage";

export default function LoginScreen() {
  const page = useLoginPage();
  const { mode, switchMode } = page;
  const fieldProps = { fields: page.fields, onChangeField: page.changeField };
  const backToLogin = () => switchMode("login");

  if (!page.isInitialized) {
    return (
      <SessionRestore
        variant="card"
        isLoading={page.isLoading}
        onRetry={page.retryRestore}
        testID="auth-bootstrap"
      />
    );
  }

  return (
    <AuthScreen
      testID="login-screen"
      belowCard={
        mode === "login" ? (
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
        ) : null
      }
    >
      <Stack gap="lg" padding="md">
        <Text size="xxl" weight="bold" align="center">
          {page.title}
        </Text>
        {mode === "login" ? (
          <LoginForm
            {...fieldProps}
            onLoggedIn={page.goHome}
            onForgotPassword={() => switchMode("reset")}
          />
        ) : null}
        {mode === "signup" ? (
          <SignupForm
            {...fieldProps}
            onSignedUp={page.goHome}
            onConfirmationRequired={page.requireConfirmation}
            onBackToLogin={backToLogin}
          />
        ) : null}
        {mode === "reset" ? (
          <ResetForm
            {...fieldProps}
            initialError={page.linkError}
            onBackToLogin={backToLogin}
          />
        ) : null}
        {mode === "set-password" ? (
          <SetPasswordForm
            {...fieldProps}
            onRequestReset={() => switchMode("reset")}
            onBackToLogin={backToLogin}
          />
        ) : null}
        {mode === "confirmation" ? (
          <ConfirmationPanel
            email={page.confirmationEmail}
            onBackToLogin={backToLogin}
          />
        ) : null}
      </Stack>
    </AuthScreen>
  );
}
