import { View, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors } from "../../theme/colors";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error";
}

const textColors: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: colors.primaryDark,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text size="sm" weight="medium" color={textColors[variant]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  default: {
    backgroundColor: colors.primarySoft,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  warning: {
    backgroundColor: colors.warningSoft,
  },
  error: {
    backgroundColor: colors.errorSoft,
  },
});
