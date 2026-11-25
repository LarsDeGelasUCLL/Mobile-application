import { StyledButton } from "../../../components/primitives";

interface BackToLoginLinkProps {
  onPress: () => void;
  testID?: string;
}

/** The "Back to log in" text link under the signup, reset, set-password and
 * confirmation views. */
export function BackToLoginLink({ onPress, testID }: BackToLoginLinkProps) {
  return (
    <StyledButton
      label="Back to log in"
      onPress={onPress}
      variant="link"
      testID={testID}
    />
  );
}
