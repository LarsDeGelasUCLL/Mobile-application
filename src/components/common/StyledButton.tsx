import { Pressable } from "react-native";
import { Spinner } from "../primitives/Spinner";
import { Text } from "../primitives/Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface StyledButtonProps {
  label: string;
  onPress: () => void;
  /**
   * Max one `primary` per screen (design §4). `danger` = destructive confirm.
   * `link` = low-emphasis text link ("Forgot password?"), sized to its text.
   */
  variant?: "primary" | "secondary" | "danger" | "link";
  isLoading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function StyledButton({
  label,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  testID,
}: StyledButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const textColor = {
    primary: colors.onPrimary,
    secondary: colors.text,
    danger: colors.error,
    link: colors.primaryText,
  }[variant];
  const inactive = isLoading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole={variant === "link" ? "link" : "button"}
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        inactive && styles.disabled,
      ]}
      testID={testID}
    >
      {isLoading ? (
        <Spinner size="small" color={textColor} />
      ) : (
        <Text weight="medium" color={textColor}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    minHeight: 48,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.lg,
    paddingVertical: t.spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primary: { backgroundColor: t.colors.primary },
  primaryPressed: { backgroundColor: t.colors.primaryPressed },
  secondary: {
    backgroundColor: t.colors.surfaceTint,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  secondaryPressed: { backgroundColor: t.colors.primarySoft },
  danger: {
    backgroundColor: t.colors.errorSoft,
    borderWidth: 1,
    borderColor: t.colors.error,
  },
  dangerPressed: { opacity: 0.85 },
  // 44pt tap height; no fill, so it reads as text.
  link: {
    minHeight: 44,
    width: "auto",
    paddingHorizontal: t.spacing.xs,
  },
  linkPressed: { opacity: 0.6 },
  disabled: { opacity: 0.5 },
}));
