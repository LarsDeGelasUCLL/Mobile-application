import { TextInput, View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors } from "../../types/theme";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  testID?: string;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  testID,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <Text size="sm" weight="medium">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={[styles.input, error !== undefined && styles.inputError]}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        testID={testID}
        autoCapitalize="none"
      />
      {error !== undefined && (
        <Text size="sm" color="red">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
});
