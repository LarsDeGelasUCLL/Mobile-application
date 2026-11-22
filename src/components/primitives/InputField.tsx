import { TextInput, View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors } from "../../theme/colors";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  testID?: string;
  keyboardType?:
    | "default"
    | "email-address"
    | "decimal-pad"
    | "phone-pad"
    | "url";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  maxLength?: number;
  editable?: boolean;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  testID,
  keyboardType = "default",
  autoCapitalize,
  multiline = false,
  maxLength,
  editable = true,
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
        style={[
          styles.input,
          multiline && styles.multiline,
          error !== undefined && styles.inputError,
        ]}
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        testID={testID}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        editable={editable}
        autoCapitalize={
          autoCapitalize ??
          (keyboardType === "email-address" || keyboardType === "url"
            ? "none"
            : "sentences")
        }
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
  multiline: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
});
