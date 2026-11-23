import { Pressable } from "react-native";
import { Icon, type IconName } from "./Icon";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface IconButtonProps {
  icon: IconName;
  /** Required: icon-only buttons have no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  color?: string;
  testID?: string;
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  color,
  testID,
}: IconButtonProps) {
  const styles = useStyles();
  const { colors, iconSize } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      <Icon
        name={icon}
        size={iconSize.lg}
        color={color ?? colors.primaryText}
      />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    width: 44,
    height: 44,
    borderRadius: t.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { backgroundColor: t.colors.primarySoft },
}));
