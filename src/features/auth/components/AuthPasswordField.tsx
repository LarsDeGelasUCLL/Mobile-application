import { InputField } from "../../../components/primitives";
import { useI18n } from "../../../i18n";

interface AuthPasswordFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

/** The "Password" input of the login and signup forms. */
export function AuthPasswordField({
  value,
  onChangeText,
  error,
}: AuthPasswordFieldProps) {
  const { t } = useI18n();
  return (
    <InputField
      label={t("auth.field.password")}
      value={value}
      onChangeText={onChangeText}
      placeholder={t("auth.field.passwordPlaceholder")}
      secureTextEntry
      error={error}
      testID="password-input"
    />
  );
}
