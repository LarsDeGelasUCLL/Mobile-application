import { View, Pressable } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface TagProps {
  label: string;
  onRemove?: () => void;
  testID?: string;
}

export function Tag({ label, onRemove, testID }: TagProps) {
  const styles = useStyles();
  return (
    <View style={styles.base} testID={testID}>
      <Text size="sm" tone="primary">
        {label}
      </Text>
      {onRemove !== undefined && (
        <Pressable
          onPress={onRemove}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
        >
          <Icon name="close" size={16} tone="primary" />
        </Pressable>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: t.colors.primarySoft,
    borderWidth: 1,
    borderColor: t.colors.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: t.spacing.xs,
    borderRadius: t.radius.full,
  },
}));
