import { Pressable } from "react-native";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface NavItemProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  icon?: string;
}

export function NavItem({ label, onPress, active = false }: NavItemProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.base, active && styles.active]}
    >
      <Text
        size="md"
        weight={active ? "bold" : "normal"}
        color={active ? colors.primaryText : colors.textMuted}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  active: {
    borderBottomColor: t.colors.primary,
  },
}));
