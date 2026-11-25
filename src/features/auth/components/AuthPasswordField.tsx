import { InputField } from "../../../components/primitives";

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
  return (
    <InputField
      label="Password"
      value={value}
      onChangeText={onChangeText}
      placeholder="At least 8 characters"
      secureTextEntry
      error={error}
      testID="password-input"
    />
  );
}
