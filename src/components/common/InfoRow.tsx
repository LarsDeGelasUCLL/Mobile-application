import { View } from "react-native";
import { Text } from "../primitives";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

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
  const { colors } = useTheme();
  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.copy}>
        <Text
          size="sm"
          weight={description !== undefined ? "medium" : "normal"}
          color={description !== undefined ? colors.text : colors.textMuted}
        >
          {label}
        </Text>
        {description !== undefined && (
          <Text size="sm" color={colors.textMuted}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.valueWrap}>
        <Text
          size="sm"
          weight="medium"
          color={highlightValue ? colors.primaryText : colors.text}
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
