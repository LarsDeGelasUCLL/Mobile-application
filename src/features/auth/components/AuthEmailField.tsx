import { InputField } from "../../../components/primitives";

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
  return (
    <InputField
      label="Email"
      value={value}
      onChangeText={onChangeText}
      placeholder="you@example.com"
      keyboardType="email-address"
      error={error}
      testID="email-input"
    />
  );
}
