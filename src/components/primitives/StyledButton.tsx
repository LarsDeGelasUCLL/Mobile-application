import { Pressable } from "react-native";
import { Spinner } from "./Spinner";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";
import type { Tone } from "../../theme/tone";

type Variant = "primary" | "secondary" | "danger" | "link";

interface StyledButtonProps {
  label: string;
  onPress: () => void;
  /**
   * Max one `primary` per screen (design §4). `danger` = destructive confirm.
   * `link` = low-emphasis text link ("Forgot password?"), sized to its text.
   */
  variant?: Variant;
  isLoading?: boolean;
  disabled?: boolean;
  testID?: string;
}

const toneByVariant: Record<Variant, Tone> = {
  primary: "onPrimary",
  secondary: "default",
  danger: "error",
  link: "primary",
};

export function StyledButton({
  label,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
  testID,
}: StyledButtonProps) {
  const styles = useStyles();
  const tone = toneByVariant[variant];
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
        <Spinner size="small" tone={tone} />
      ) : (
        <Text weight="medium" tone={tone}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    minHeight: t.controlSize.control,
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
    minHeight: t.controlSize.touch,
    width: "auto",
    paddingHorizontal: t.spacing.xs,
  },
  linkPressed: { opacity: 0.6 },
  disabled: { opacity: 0.5 },
}));
