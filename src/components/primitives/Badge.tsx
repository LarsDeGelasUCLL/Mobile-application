import { View } from "react-native";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error";
  testID?: string;
}

export function Badge({ label, variant = "default", testID }: BadgeProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const textColor =
    variant === "default" ? colors.primaryText : colors[variant];
  return (
    <View style={[styles.base, styles[variant]]} testID={testID}>
      <Text size="sm" weight="medium" color={textColor}>
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
