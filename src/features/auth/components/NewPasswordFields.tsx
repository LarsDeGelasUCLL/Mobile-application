import { InputField, Stack } from "../../../components/primitives";
import { useI18n } from "../../../i18n";
import type { NewPasswordErrors } from "../authValidation";

interface NewPasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  /** From `validateNewPassword`. */
  errors: NewPasswordErrors;
  passwordLabel?: string;
  passwordTestID?: string;
  confirmPasswordTestID?: string;
  testID?: string;
}

/** New password + confirm, for the reset link and the settings page. */
export function NewPasswordFields({
  password,
  confirmPassword,
  onChangePassword,
  onChangeConfirmPassword,
  errors,
  passwordLabel,
  passwordTestID,
  confirmPasswordTestID,
  testID,
}: NewPasswordFieldsProps) {
  const { t } = useI18n();
  return (
    <Stack gap="lg" testID={testID}>
      <InputField
        label={passwordLabel ?? t("auth.field.newPassword")}
        value={password}
        onChangeText={onChangePassword}
        placeholder={t("auth.field.passwordPlaceholder")}
        secureTextEntry
        error={errors.passwordError && t(errors.passwordError)}
        testID={passwordTestID}
      />
      <InputField
        label={t("auth.field.confirmPassword")}
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        placeholder={t("auth.field.confirmPasswordPlaceholder")}
        secureTextEntry
        error={
          errors.confirmPasswordError && t(errors.confirmPasswordError)
        }
        testID={confirmPasswordTestID}
      />
    </Stack>
  );
}
