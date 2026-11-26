import { StyledButton } from "../../../components/primitives";
import { useI18n } from "../../../i18n";

interface BackToLoginLinkProps {
  onPress: () => void;
  testID?: string;
}

/** The "Back to log in" text link under the signup, reset, set-password and
 * confirmation views. */
export function BackToLoginLink({ onPress, testID }: BackToLoginLinkProps) {
  const { t } = useI18n();
  return (
    <StyledButton
      label={t("auth.backToLogin")}
      onPress={onPress}
      variant="link"
      testID={testID}
    />
  );
}
