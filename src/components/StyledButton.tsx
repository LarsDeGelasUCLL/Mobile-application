import { Pressable, StyleSheet } from "react-native";
import { Spinner } from "./primitives/Spinner";
import { Text } from "./primitives/Text";
import { colors } from "../types/theme";

interface StyledButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  testID?: string;
}

export function StyledButton({
  label,
  onPress,
  variant = "primary",
  isLoading = false,
  testID,
}: StyledButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        isLoading && styles.disabled,
      ]}
      testID={testID}
    >
      {isLoading ? (
        <Spinner size="small" />
      ) : (
        <Text
          weight="medium"
          color={variant === "primary" ? "#FFFFFF" : colors.text}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceTint,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
