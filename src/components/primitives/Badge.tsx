import { View } from "react-native";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";
import type { Tone } from "../../theme/tone";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error";
  testID?: string;
}

/** A small pill label, e.g. a role or status. */
export function Badge({ label, variant = "default", testID }: BadgeProps) {
  const styles = useStyles();
  const tone: Tone = variant === "default" ? "primary" : variant;
  return (
    <View style={[styles.base, styles[variant]]} testID={testID}>
      <Text size="sm" weight="medium" tone={tone}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: t.spacing.xs,
    borderRadius: t.radius.full,
  },
  default: { backgroundColor: t.colors.primarySoft },
  success: { backgroundColor: t.colors.successSoft },
  warning: { backgroundColor: t.colors.warningSoft },
  error: { backgroundColor: t.colors.errorSoft },
}));
