import { Pressable, View } from "react-native";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface RadioProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}

export function Radio({ label, value, selected, onSelect }: RadioProps) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => onSelect(value)}
      style={styles.container}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.circle, selected && styles.circleSelected]}>
        {selected && <View style={styles.dot} />}
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
    minHeight: 44,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: t.radius.full,
    borderWidth: 1.5,
    borderColor: t.colors.borderStrong,
    backgroundColor: t.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  circleSelected: {
    borderColor: t.colors.primary,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: t.radius.full,
    backgroundColor: t.colors.primary,
  },
}));
