import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface StickyFooterProps {
  children: React.ReactNode;
  testID?: string;
}

/** Bottom bar for the screen's one primary action. Prefer `<Screen footer={...}>`. */
export function StickyFooter({ children, testID }: StickyFooterProps) {
  const styles = useStyles();
  const { spacing } = useTheme();
  const { bottom } = useSafeAreaInsets();
  return (
    <View
      style={[styles.base, { paddingBottom: Math.max(bottom, spacing.md) }]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    gap: t.spacing.sm,
    paddingHorizontal: t.spacing.lg,
    paddingTop: t.spacing.md,
    backgroundColor: t.colors.surface,
    borderTopWidth: 1,
    borderTopColor: t.colors.border,
  },
}));
