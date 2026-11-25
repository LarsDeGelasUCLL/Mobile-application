import { useState } from "react";
import { router } from "expo-router";
import { useAuthStore } from "../../../src/state/useAuthStore";
import {
  FeedbackBanner,
  InputField,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
} from "../../../src/components/primitives";
import { validatePassword } from "../../../src/features/auth/authValidation";

export default function ChangePasswordScreen() {
  const setPassword = useAuthStore((state) => state.setPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>();
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordRequestError, setPasswordRequestError] = useState("");

  const handleSetPassword = async () => {
    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError =
      confirmPassword === password ? undefined : "Passwords must match.";
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setPasswordMessage("");
    setPasswordRequestError("");
    if (nextPasswordError || nextConfirmPasswordError) return;

    try {
      await setPassword({ password });
      setPasswordValue("");
      setConfirmPassword("");
      setPasswordMessage("Your password was updated.");
    } catch (passwordError) {
      setPasswordRequestError(
        passwordError instanceof Error
          ? passwordError.message
          : "Could not update the password. Please retry.",
      );
    }
  };

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label="Update password"
          onPress={handleSetPassword}
          isLoading={isLoading}
          testID="change-password-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Password"
          onBack={() =>
            router.canGoBack() ? router.back() : router.replace("/settings")
          }
          testID="change-password-header"
        />
        <InputField
          label="New password"
          value={password}
          onChangeText={setPasswordValue}
          placeholder="At least 8 characters"
          secureTextEntry
          error={passwordError}
          testID="settings-new-password-input"
        />
        <InputField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          secureTextEntry
          error={confirmPasswordError}
          testID="settings-confirm-password-input"
        />
        {passwordRequestError !== "" ? (
          <FeedbackBanner
            tone="error"
            message={passwordRequestError}
            testID="change-password-error"
          />
        ) : null}
        {passwordMessage !== "" ? (
          <FeedbackBanner
            tone="success"
            message={passwordMessage}
            testID="change-password-success"
          />
        ) : null}
      </Stack>
    </Screen>
  );
}
