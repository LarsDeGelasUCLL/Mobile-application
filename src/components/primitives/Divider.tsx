import { View } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  spacing?: "none" | "sm" | "md" | "lg";
}

export function Divider({
  orientation = "horizontal",
  spacing = "none",
}: DividerProps) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.base,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        styles[`spacing_${spacing}`],
      ]}
    />
  );
}

const useStyles = makeStyles((t) => ({
  base: { backgroundColor: t.colors.border },
  horizontal: { height: 1, width: "100%" },
  vertical: { width: 1, height: "100%" },
  spacing_none: { margin: 0 },
  spacing_sm: { marginVertical: t.spacing.sm },
  spacing_md: { marginVertical: t.spacing.lg },
  spacing_lg: { marginVertical: t.spacing.xl },
}));
