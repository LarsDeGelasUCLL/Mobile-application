import { useState } from "react";
import {
  CollapsibleSection,
  InputField,
  StyledButton,
} from "../../../components/primitives";
import { useI18n, type TranslationKey } from "../../../i18n";
import { validateInviteEmail } from "../groupValidation";

interface InviteByEmailFormProps {
  isLoading: boolean;
  /** Gets the validated email; resolves whether the invitation was sent. */
  onInvite: (email: string) => Promise<boolean>;
  testID?: string;
}

/** "Invite by email" (admins). Clears the field once the invitation is sent. */
export function InviteByEmailForm({
  isLoading,
  onInvite,
  testID,
}: InviteByEmailFormProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<TranslationKey>();

  const invite = async () => {
    const validationError = validateInviteEmail(email);
    setEmailError(validationError);
    if (validationError) return;
    if (await onInvite(email)) setEmail("");
  };

  return (
    <CollapsibleSection title={t("groups.inviteEmail.title")} testID={testID}>
      <InputField
        label={t("groups.inviteEmail.label")}
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setEmailError(undefined);
        }}
        placeholder={t("groups.inviteEmail.placeholder")}
        keyboardType="email-address"
        error={emailError && t(emailError)}
        testID="group-invite-email-input"
      />
      <StyledButton
        label={t("groups.inviteEmail.submit")}
        onPress={() => void invite()}
        variant="secondary"
        isLoading={isLoading}
        testID="group-invite-button"
      />
    </CollapsibleSection>
  );
}
