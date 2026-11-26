import { Pressable } from "react-native";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface NavItemProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  /** Accepted but not rendered. */
  icon?: string;
  testID?: string;
}

/** One text tab in a `Nav`; the active tab is underlined. */
export function NavItem({
  label,
  onPress,
  active = false,
  testID,
}: NavItemProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.base, active && styles.active]}
      testID={testID}
    >
      <Text
        size="md"
        weight={active ? "bold" : "normal"}
        tone={active ? "primary" : "muted"}
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
