import { InputField, Stack } from "../../../components/primitives";
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
  passwordLabel = "New password",
  passwordTestID,
  confirmPasswordTestID,
  testID,
}: NewPasswordFieldsProps) {
  return (
    <Stack gap="lg" testID={testID}>
      <InputField
        label={passwordLabel}
        value={password}
        onChangeText={onChangePassword}
        placeholder="At least 8 characters"
        secureTextEntry
        error={errors.passwordError}
        testID={passwordTestID}
      />
      <InputField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={onChangeConfirmPassword}
        placeholder="Repeat your password"
        secureTextEntry
        error={errors.confirmPasswordError}
        testID={confirmPasswordTestID}
      />
    </Stack>
  );
}
