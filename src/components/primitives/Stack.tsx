import { View } from "react-native";
import { makeStyles } from "../../theme/ThemeProvider";

interface StackProps {
  children: React.ReactNode;
  gap?: "none" | "sm" | "md" | "lg";
  align?: "flex-start" | "center" | "flex-end" | "stretch";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  padding?: "none" | "sm" | "md" | "lg";
  flex?: number;
  testID?: string;
}

export function Stack({
  children,
  gap = "none",
  align = "stretch",
  justify = "flex-start",
  padding = "none",
  flex,
  testID,
}: StackProps) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.base,
        styles[`gap_${gap}`],
        styles[`padding_${padding}`],
        { alignItems: align, justifyContent: justify },
        flex !== undefined && { flex },
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: { flexDirection: "column" },
  gap_none: { gap: 0 },
  gap_sm: { gap: t.spacing.sm },
  gap_md: { gap: t.spacing.lg },
  gap_lg: { gap: t.spacing.xl },
  padding_none: { padding: 0 },
  padding_sm: { padding: t.spacing.sm },
  padding_md: { padding: t.spacing.lg },
  padding_lg: { padding: t.spacing.xl },
}));
