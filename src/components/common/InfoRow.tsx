import { StyleSheet, View } from "react-native";
import { Text } from "../primitives";
import { colors } from "../../theme/colors";

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
  return (
    <View style={styles.row} testID={testID}>
      <View style={styles.copy}>
        <Text
          size="sm"
          weight={description !== undefined ? "medium" : "normal"}
          color={description !== undefined ? colors.text : colors.muted}
        >
          {label}
        </Text>
        {description !== undefined && (
          <Text size="sm" color={colors.muted}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.valueWrap}>
        <Text
          size="sm"
          weight="medium"
          color={highlightValue ? colors.primaryDark : colors.text}
          align="right"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  valueWrap: {
    flexShrink: 1,
    alignItems: "flex-end",
  },
});
