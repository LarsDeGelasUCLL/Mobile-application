import { Pressable, View, StyleSheet } from "react-native";
import { Text } from "./Text";

interface RadioProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}

export function Radio({ label, value, selected, onSelect }: RadioProps) {
  return (
    <Pressable onPress={() => onSelect(value)} style={styles.container}>
      <View style={[styles.circle, selected && styles.circleSelected]}>
        {selected && <View style={styles.dot} />}
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
  circle: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  circleSelected: {
    borderColor: "#2563EB",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
});
