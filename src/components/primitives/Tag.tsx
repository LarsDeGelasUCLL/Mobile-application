import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <View style={styles.base}>
      <Text size="sm">{label}</Text>
      {onRemove !== undefined && (
        <Pressable onPress={onRemove} style={styles.removeButton}>
          <Text size="sm">×</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  removeButton: {
    paddingHorizontal: 4,
  },
});
