import { View } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface NavProps {
  children: React.ReactNode;
}

export function Nav({ children }: NavProps) {
  const styles = useStyles();
  return <View style={styles.base}>{children}</View>;
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: "row",
    backgroundColor: t.colors.surface,
    borderBottomWidth: 1,
    borderColor: t.colors.border,
    paddingHorizontal: t.spacing.sm,
    gap: t.spacing.sm,
  },
}));
