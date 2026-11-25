import { Pressable } from "react-native";
import { Icon, type IconName } from "./Icon";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";
import type { Tone } from "../../theme/tone";

interface IconButtonProps {
  icon: IconName;
  /** Required: icon-only buttons have no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  tone?: Tone;
  testID?: string;
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  tone = "default",
  testID,
}: IconButtonProps) {
  const styles = useStyles();
  const { iconSize } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      testID={testID}
    >
      <Icon name={icon} size={iconSize.lg} tone={tone} />
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    width: t.controlSize.touch,
    height: t.controlSize.touch,
    borderRadius: t.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { backgroundColor: t.colors.primarySoft },
}));
