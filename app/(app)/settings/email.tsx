import { useState } from "react";
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
import { errorMessage, useI18n, type TranslationKey } from "../../../src/i18n";

export default function ChangeEmailScreen() {
  const { t } = useI18n();
  const user = useAuthStore((state) => state.user);
  const changeEmail = useAuthStore((state) => state.changeEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<TranslationKey>();
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
      setEmailMessage(t("feedback.emailChangeSent"));
      setNewEmail("");
    } catch (emailError) {
      setEmailRequestError(
        errorMessage(emailError, "errors.fallback.requestEmailChange"),
      );
    }
  };

  return (
    <Screen
      padding="lg"
      footer={
        <StyledButton
          label={t("settings.email.submit")}
          onPress={handleChangeEmail}
          isLoading={isLoading}
          testID="change-email-button"
        />
      }
    >
      <Stack gap="lg">
        <ScreenHeader
          title={t("settings.email.title")}
          subtitle={t("settings.email.current", {
            email: user?.emailAddress ?? t("settings.email.notAvailable"),
          })}
          onBack={() => goBackOr("/settings")}
          testID="change-email-header"
        />
        <InputField
          label={t("settings.email.newLabel")}
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder={t("settings.email.placeholder")}
          keyboardType="email-address"
          error={emailError && t(emailError)}
          testID="profile-new-email-input"
        />
        <Text size="sm" tone="muted">
          {t("settings.email.hint")}
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
