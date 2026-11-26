import { useState } from "react";
import { Pressable, View } from "react-native";
import { Icon } from "./Icon";
import { Text } from "./Text";
import { makeStyles, useTheme } from "../../theme/ThemeProvider";

interface CollapsibleSectionProps {
  title: string;
  /** Shown as "Title (n)". */
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  testID?: string;
}

/** A card with a header that shows or hides its content. */
export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
  testID,
}: CollapsibleSectionProps) {
  const styles = useStyles();
  const { iconSize } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const heading = count !== undefined ? `${title} (${count})` : title;

  // shortcut: instant toggle, no height animation (so nothing to turn off for reduced motion); add one if the jump feels abrupt.
  return (
    <View style={styles.base} testID={testID}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        testID={testID !== undefined ? `${testID}-toggle` : undefined}
      >
        <View style={styles.title}>
          <Text weight="bold">{heading}</Text>
        </View>
        <Icon
          name={open ? "chevron-up" : "chevron-down"}
          size={iconSize.md}
          tone="muted"
        />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    backgroundColor: t.colors.surface,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: t.controlSize.row,
    paddingHorizontal: t.spacing.lg,
  },
  title: { flex: 1 },
  pressed: { backgroundColor: t.colors.surfaceTint },
  body: {
    gap: t.spacing.md,
    padding: t.spacing.lg,
    paddingTop: 0,
  },
}));
