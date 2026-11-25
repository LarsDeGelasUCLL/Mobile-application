import { View } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface RowProps {
  children: React.ReactNode;
  gap?: "none" | "sm" | "md" | "lg";
  align?: "flex-start" | "center" | "flex-end" | "stretch";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  wrap?: boolean;
  testID?: string;
}

export function Row({
  children,
  gap = "none",
  align = "center",
  justify = "flex-start",
  wrap = false,
  testID,
}: RowProps) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.base,
        styles[`gap_${gap}`],
        { alignItems: align, justifyContent: justify },
        wrap && styles.wrap,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: { flexDirection: "row" },
  wrap: { flexWrap: "wrap" },
  gap_none: { gap: 0 },
  gap_sm: { gap: t.spacing.sm },
  gap_md: { gap: t.spacing.lg },
  gap_lg: { gap: t.spacing.xl },
}));
