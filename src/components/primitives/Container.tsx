import { View } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface ContainerProps {
  children: React.ReactNode;
  flex?: number;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Container({
  children,
  flex,
  padding = "none",
}: ContainerProps) {
  const styles = useStyles();
  return (
    <View
      style={[styles.base, flex !== undefined && { flex }, styles[padding]]}
    >
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: { width: "100%" },
  none: { padding: 0 },
  sm: { padding: t.spacing.sm },
  md: { padding: t.spacing.lg },
  lg: { padding: t.spacing.xl },
}));
