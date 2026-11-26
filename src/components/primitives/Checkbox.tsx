import { Pressable, View } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  testID?: string;
}

/** A labelled checkbox; the whole row is the tap target. */
export function Checkbox({
  label,
  checked,
  onChange,
  testID,
}: CheckboxProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={styles.container}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      testID={testID}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Icon name="checkmark" size={16} tone="onPrimary" />}
      </View>
      <Text size="md">{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: t.controlSize.touch,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: t.colors.borderStrong,
    backgroundColor: t.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: t.colors.primary,
    borderColor: t.colors.primary,
  },
}));
