import { useState } from "react";
import { getErrorMessage } from "../../../src/utils/errors";
import { goBackOr } from "../../../src/features/navigation/goBackOr";
import { useAuthStore } from "../../../src/state/useAuthStore";
import {
  FeedbackBanner,
  InputField,
  Screen,
  ScreenHeader,
  Stack,
  StyledButton,
  Text,
} from "../../../src/components/primitives";
import { validateEmail } from "../../../src/features/auth/authValidation";

export default function ChangeEmailScreen() {
  const user = useAuthStore((state) => state.user);
  const changeEmail = useAuthStore((state) => state.changeEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [emailMessage, setEmailMessage] = useState("");
  const [emailRequestError, setEmailRequestError] = useState("");

  const handleChangeEmail = async () => {
    const nextEmailError = validateEmail(newEmail);
    setEmailError(nextEmailError);
    setEmailMessage("");
    setEmailRequestError("");
    if (nextEmailError) return;

    try {
      await changeEmail({ email: newEmail });
      setEmailMessage(
        "Confirmation was sent. Check both email addresses to finish the change.",
      );
      setNewEmail("");
    } catch (emailError) {
      setEmailRequestError(
        getErrorMessage(
          emailError,
          "Could not request the email change. Please retry.",
        ),
      );
    }
  };

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label="Request email change"
          onPress={handleChangeEmail}
          isLoading={isLoading}
          testID="change-email-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title="Email"
          subtitle={`Current: ${user?.emailAddress ?? "Not available"}`}
          onBack={() => goBackOr("/settings")}
          testID="change-email-header"
        />
        <InputField
          label="New email"
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="new@example.com"
          keyboardType="email-address"
          error={emailError}
          testID="profile-new-email-input"
        />
        <Text size="sm" tone="muted">
          We send a confirmation link to both addresses. The change finishes
          once you confirm.
        </Text>
        {emailRequestError !== "" ? (
          <FeedbackBanner
            tone="error"
            message={emailRequestError}
            testID="change-email-error"
          />
        ) : null}
        {emailMessage !== "" ? (
          <FeedbackBanner
            tone="success"
            message={emailMessage}
            testID="change-email-success"
          />
        ) : null}
      </Stack>
    </Screen>
  );
}
