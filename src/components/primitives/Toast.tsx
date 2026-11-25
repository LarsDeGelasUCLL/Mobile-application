import { View } from "react-native";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";
import type { Tone } from "../../theme/tone";

interface ToastProps {
  message: string;
  variant?: "default" | "success" | "error";
  visible: boolean;
  testID?: string;
}

export function Toast({
  message,
  variant = "default",
  visible,
  testID,
}: ToastProps) {
  const styles = useStyles();
  if (!visible) return null;

  // Default toast inverts the page colours; status toasts reuse the tested status/soft pairs.
  const tone: Tone = variant === "default" ? "inverse" : variant;
  return (
    <View
      style={[styles.base, styles[variant]]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <Text size="sm" weight="medium" tone={tone} align="center">
        {message}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    position: "absolute",
    bottom: t.spacing.xl,
    left: t.spacing.lg,
    right: t.spacing.lg,
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    borderRadius: t.radius.md,
    borderWidth: 1,
    alignItems: "center",
    zIndex: 50,
  },
  default: { backgroundColor: t.colors.text, borderColor: t.colors.text },
  success: {
    backgroundColor: t.colors.successSoft,
    borderColor: t.colors.success,
  },
  error: { backgroundColor: t.colors.errorSoft, borderColor: t.colors.error },
}));
