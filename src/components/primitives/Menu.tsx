import { View, Pressable } from "react-native";
import { Text } from "./Text";
import { makeStyles } from "../../theme/ThemeProvider";

interface MenuItem {
  label: string;
  onPress: () => void;
}

interface MenuProps {
  items: MenuItem[];
  visible: boolean;
  onClose: () => void;
}

export function Menu({ items, visible, onClose }: MenuProps) {
  const styles = useStyles();
  if (!visible) return null;

  return (
    <>
      <Pressable onPress={onClose} style={styles.overlay} />
      <View style={styles.menu}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="menuitem"
            onPress={() => {
              item.onPress();
              onClose();
            }}
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.pressed,
            ]}
          >
            <Text size="md">{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const useStyles = makeStyles((t) => ({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  menu: {
    position: "absolute",
    top: 48,
    right: t.spacing.lg,
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.sm,
    borderWidth: 1,
    borderColor: t.colors.border,
    minWidth: 160,
    zIndex: 20,
    overflow: "hidden",
  },
  menuItem: {
    paddingVertical: t.spacing.md,
    paddingHorizontal: t.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  pressed: { backgroundColor: t.colors.surfaceTint },
}));
