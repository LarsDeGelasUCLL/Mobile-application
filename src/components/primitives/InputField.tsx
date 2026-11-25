import { TextInput, View } from "react-native";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

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
  const styles = useStyles();
  const { colors } = useTheme();
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
        accessibilityLabel={label}
        style={[
          styles.input,
          multiline && styles.multiline,
          !editable && styles.readOnly,
          error !== undefined && styles.inputError,
        ]}
        placeholderTextColor={colors.textMuted}
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
        <Text size="sm" tone="error">
          {error}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    width: "100%",
    gap: 6,
    marginBottom: t.spacing.xs,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: t.colors.borderStrong,
    borderRadius: t.radius.sm,
    paddingHorizontal: 14,
    ...t.type.md,
    fontFamily: t.fontFamily.regular,
    backgroundColor: t.colors.surface,
    color: t.colors.text,
  },
  readOnly: {
    backgroundColor: t.colors.surfaceTint,
    borderColor: t.colors.border,
  },
  inputError: {
    borderColor: t.colors.error,
    backgroundColor: t.colors.errorSoft,
  },
  multiline: {
    height: 100,
    paddingTop: t.spacing.md,
    textAlignVertical: "top",
  },
}));
