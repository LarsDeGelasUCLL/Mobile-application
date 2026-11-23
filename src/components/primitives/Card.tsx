import { View, Pressable } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export function Card({ children, onPress }: CardProps) {
  const styles = useStyles();
  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.base, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={styles.base}>{children}</View>;
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
  pressed: { backgroundColor: t.colors.surfaceTint },
}));
