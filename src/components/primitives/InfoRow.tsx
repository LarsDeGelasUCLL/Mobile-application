import { View } from "react-native";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface InfoRowProps {
  label: string;
  value: string;
  description?: string;
  highlightValue?: boolean;
  testID?: string;
}

export function InfoRow({
  label,
  value,
  description,
  highlightValue = false,
  testID,
}: InfoRowProps) {
  const styles = useStyles();
  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.copy}>
        <Text
          size="sm"
          weight={description !== undefined ? "medium" : "normal"}
          tone={description !== undefined ? "default" : "muted"}
        >
          {label}
        </Text>
        {description !== undefined && (
          <Text size="sm" tone="muted">
            {description}
          </Text>
        )}
      </View>
      <View style={styles.valueWrap}>
        <Text
          size="sm"
          weight="medium"
          tone={highlightValue ? "primary" : "default"}
          align="right"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.spacing.md,
    paddingVertical: t.spacing.xs,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  valueWrap: {
    flexShrink: 1,
    alignItems: "flex-end",
  },
}));
