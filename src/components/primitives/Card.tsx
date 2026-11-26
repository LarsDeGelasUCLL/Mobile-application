import { View, Pressable } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  /** No padding, clipped corners: for a group of `ListRow`s. */
  flush?: boolean;
  testID?: string;
}

/** A bordered surface. With `onPress` the whole card is a button. */
export function Card({
  children,
  onPress,
  flush = false,
  testID,
}: CardProps) {
  const styles = useStyles();
  const base = [styles.base, flush && styles.flush];
  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [...base, pressed && styles.pressed]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={base} testID={testID}>
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    padding: t.spacing.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    width: "100%",
  },
  flush: { padding: 0, overflow: "hidden" },
  pressed: { backgroundColor: t.colors.surfaceTint },
}));
