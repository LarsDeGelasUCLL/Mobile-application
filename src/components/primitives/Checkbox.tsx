import { Pressable, View, StyleSheet } from "react-native";
import { Text } from "./Text";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <Pressable onPress={() => onChange(!checked)} style={styles.container}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Text size="sm" color="#FFFFFF" weight="bold">
            ✓
          </Text>
        )}
      </View>
      <Text size="md">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
});
