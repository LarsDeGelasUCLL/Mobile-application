import { useState } from "react";
import {
  CollapsibleSection,
  InputField,
  StyledButton,
} from "../../../components/primitives";
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
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();

  const invite = async () => {
    const validationError = validateInviteEmail(email);
    setEmailError(validationError);
    if (validationError) return;
    if (await onInvite(email)) setEmail("");
  };

  return (
    <CollapsibleSection title="Invite by email" testID={testID}>
      <InputField
        label="Email address"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setEmailError(undefined);
        }}
        placeholder="friend@example.com"
        keyboardType="email-address"
        error={emailError}
        testID="group-invite-email-input"
      />
      <StyledButton
        label="Send invitation"
        onPress={() => void invite()}
        variant="secondary"
        isLoading={isLoading}
        testID="group-invite-button"
      />
    </CollapsibleSection>
  );
}
