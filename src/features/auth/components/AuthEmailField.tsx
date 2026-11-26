import { InputField } from "../../../components/primitives";
import { useI18n } from "../../../i18n";

interface AuthEmailFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
}

/** The "Email" input of the login, signup and reset forms. */
export function AuthEmailField({
  value,
  onChangeText,
  error,
}: AuthEmailFieldProps) {
  const { t } = useI18n();
  return (
    <InputField
      label={t("auth.field.email")}
      value={value}
      onChangeText={onChangeText}
      placeholder={t("auth.field.emailPlaceholder")}
      keyboardType="email-address"
      error={error}
      testID="email-input"
    />
  );
}
